import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DB_ID, USERS_COL, RESUMES_COL, ID, Query } from '../appwrite';
import axios from 'axios';
import logoImg from '../assets/image.png';

function ScoreRing({ score, size = 96, stroke = 8, color = '#4f46e5', label }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  return (
    <div className="score-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(.22,.61,.36,1)' }} />
      </svg>
      <div className="score-ring-label">
        <div style={{ fontSize: size === 96 ? '1.4rem' : '1rem', fontWeight: 900, color: 'var(--text-1)' }}>{score}%</div>
        {label && <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

const scoreColor = s => s >= 75 ? '#059669' : s >= 50 ? '#d97706' : '#dc2626';

export default function Dashboard({ user, setUser }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fields, setFields] = useState({ targetRole: '', company: '', payScale: '', experienceLevel: 'Entry-Level', jobDescription: '' });
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showAd, setShowAd] = useState(false);
  const [showReality, setShowReality] = useState(false);
  const fileRef = useRef();
  const videoRef = useRef();
  const [userMobile, setUserMobile] = useState('');

  useEffect(() => {
    if (!user) return;
    // Fetch user mobile from DB
    databases.getDocument(DB_ID, USERS_COL, user.$id)
      .then(doc => setUserMobile(doc.mobile || ''))
      .catch(() => {});
    fetchHistory();
  }, [user]);

  const fetchHistory = async () => {
    if (!user) return;
    setHistoryLoading(true);
    try {
      const res = await databases.listDocuments(DB_ID, RESUMES_COL, [
        Query.equal('userId', user.$id),
        Query.orderDesc('createdAt'),
        Query.limit(50),
      ]);
      setHistory(res.documents.map(d => ({ id: d.$id, ...d })));
    } catch(e) { console.error(e); }
    setHistoryLoading(false);
  };

  const setField = e => setFields(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
    else alert('Please upload a PDF file only.');
  };

  const handleAnalyze = async e => {
    e.preventDefault();
    if (!file) return alert('Please select a PDF resume to analyze.');
    if (!user) return alert('You must be logged in to analyze a resume.');
    setLoading(true); setResult(null);
    setShowAd(true); // ← show ad popup
    try {
      setStatusText('Parsing resume...');
      const fd = new FormData();
      fd.append('resume', file);
      Object.entries(fields).forEach(([k, v]) => { if (v) fd.append(k, v); });

      setStatusText('Analyzing with AI (this may take 10–20 seconds)...');
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze`, fd);

      setStatusText('Saving your results...');
      let mobile = userMobile;
      if (!mobile) {
        try {
          const userDoc = await databases.getDocument(DB_ID, USERS_COL, user.$id);
          mobile = userDoc.mobile || '';
        } catch (_) {}
      }

      const docData = {
        userId: user.$id,
        userName: user.name,
        userEmail: user.email,
        userMobile: mobile,
        fileName: file.name,
        fileUrl: data.fileUrl,
        storageProvider: 'appwrite',
        targetRole: fields.targetRole,
        company: fields.company,
        payScale: fields.payScale,
        overallScore: data.data.overallScore,
        createdAt: new Date().toISOString(),
        atsData: JSON.stringify(data.data),
      };
      const saved = await databases.createDocument(DB_ID, RESUMES_COL, ID.unique(), docData);
      setResult({ ...docData, id: saved.$id, atsData: data.data });
      fetchHistory();
      setShowAd(false);      // ← close ad
      setShowReality(true);  // ← show reality check popup (results load after dismiss)
    } catch(err) {
      console.error(err);
      setShowAd(false);
      const detail = err.response?.data?.details || err.response?.data?.error || err.message;
      alert(`Analysis failed.\n\nError: ${detail}`);
    }
    setLoading(false); setStatusText('');
  };

  /* ── helpers for Reality Check ── */
  const getRating = s => s >= 80 ? { face:'😄', label:'Good', color:'#16a34a' }
    : s >= 60 ? { face:'😐', label:'Medium', color:'#d97706' }
    : s >= 40 ? { face:'😟', label:'Poor', color:'#ea580c' }
    : { face:'😣', label:'Very Bad', color:'#dc2626' };

  const getPayReality = (payScale, score) => {
    if (!payScale) return null;
    const nums = payScale.match(/(\d+)/g);
    if (!nums) return null;
    const asked = parseInt(nums[0]);
    const factor = score >= 75 ? 1 : score >= 55 ? 0.65 : 0.40;
    const realistic = Math.round(asked * factor);
    return { asked, realistic, factor };
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── Ad Popup Modal ─── */}
      {showAd && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: 'fadeIn 0.35s ease',
        }}>
          <div style={{
            width: '100%', maxWidth: 560,
            background: '#0f0f1a',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
            border: '1px solid rgba(255,255,255,0.08)',
            position: 'relative',
          }}>
            {/* Ad label */}
            <div style={{
              position: 'absolute', top: 12, left: 14, zIndex: 2,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              padding: '3px 10px', borderRadius: 20,
              fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Ad</div>

            {/* Video */}
            <video
              ref={videoRef}
              src="/1779108389699.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
            />

            {/* Bottom status bar */}
            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {statusText || 'Analyzing your resume with AI…'}
                </span>
              </div>
              {/* Animated progress bar */}
              <div style={{ marginTop: 10, height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg,#6366f1,#8b5cf6)',
                  animation: 'progressSlide 18s linear forwards',
                }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reality Check Popup ─── */}
      {showReality && result && (() => {
        const score = result.atsData.overallScore;
        const rating = getRating(score);
        const missing = result.atsData.missingSkills?.slice(0, 6) || [];
        const payInfo = getPayReality(result.payScale, score);
        const company = result.company || 'this company';
        const role = result.targetRole || 'this role';
        const chancePct = score >= 75 ? 55 : score >= 55 ? 28 : 10;
        return (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', animation: 'fadeIn 0.3s ease',
          }}>
            <div style={{
              width: '100%', maxWidth: 520, background: '#0f0f1a',
              borderRadius: 24, overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.09)',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
            }}>
              {/* Header */}
              <div style={{
                background: 'linear-gradient(135deg,#1a0a0a,#2d0d0d)',
                padding: '28px 28px 20px',
                borderBottom: '1px solid rgba(255,60,60,0.15)',
              }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <span style={{ fontSize:'3rem', lineHeight:1 }}>{rating.face}</span>
                  <div>
                    <div style={{ fontSize:'0.65rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,100,100,0.7)', marginBottom:4 }}>Reality Check</div>
                    <div style={{ fontSize:'1.45rem', fontWeight:900, color:'white', lineHeight:1.1 }}>Your ATS Score: <span style={{ color: rating.color }}>{score}%</span></div>
                    <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', marginTop:3 }}>{rating.label} — Here's the hard truth about your profile</div>
                  </div>
                </div>
                {/* Rating faces row */}
                <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:6 }}>
                  {[{f:'😣',l:'Very Bad',min:0,max:39},{f:'😟',l:'Poor',min:40,max:59},{f:'😐',l:'Medium',min:60,max:74},{f:'😊',l:'Good',min:75,max:89},{f:'😄',l:'Excellent',min:90,max:100}].map((r,i) => {
                    const active = score >= r.min && score <= r.max;
                    return (
                      <div key={i} style={{ flex:1, textAlign:'center', opacity: active ? 1 : 0.3, transition:'opacity 0.2s' }}>
                        <div style={{ fontSize: active ? '1.6rem' : '1.1rem', lineHeight:1, marginBottom:3 }}>{r.f}</div>
                        <div style={{ fontSize:'0.55rem', color: active ? 'white' : 'rgba(255,255,255,0.4)', fontWeight:700, textTransform:'uppercase', letterSpacing:'0.06em' }}>{r.l}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Body */}
              <div style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>

                {/* Company likelihood */}
                <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#f87171', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>⚠ Company Fit</div>
                  <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.8)', lineHeight:1.6, margin:0 }}>
                    With a score of <strong style={{color:'#f87171'}}>{score}%</strong>, you have roughly a <strong style={{color:'#f87171'}}>{chancePct}% chance</strong> of getting a callback from <strong style={{color:'white'}}>{company}</strong>. Most top companies shortlist only candidates scoring <strong style={{color:'white'}}>above 75%</strong>.
                  </p>
                </div>

                {/* Missing skills */}
                {missing.length > 0 && (
                  <div style={{ background:'rgba(234,88,12,0.1)', border:'1px solid rgba(234,88,12,0.25)', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#fb923c', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>🚫 You're Lacking These Critical Skills</div>
                    <p style={{ fontSize:'0.8rem', color:'rgba(255,255,255,0.6)', marginBottom:10, lineHeight:1.5 }}>
                      Without these, you <strong style={{color:'#fb923c'}}>cannot qualify</strong> for <strong style={{color:'white'}}>{role}</strong>:
                    </p>
                    <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
                      {missing.map((s,i) => (
                        <span key={i} style={{ background:'rgba(234,88,12,0.2)', border:'1px solid rgba(234,88,12,0.4)', borderRadius:100, padding:'4px 12px', fontSize:'0.75rem', fontWeight:600, color:'#fed7aa' }}>✕ {s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pay scale reality */}
                {payInfo && (
                  <div style={{ background:'rgba(100,116,139,0.12)', border:'1px solid rgba(100,116,139,0.25)', borderRadius:12, padding:'14px 16px' }}>
                    <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#94a3b8', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:8 }}>💸 Pay Scale Reality</div>
                    <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginBottom:3 }}>You Expect</div>
                        <div style={{ fontSize:'1.2rem', fontWeight:900, color:'rgba(255,255,255,0.35)', textDecoration:'line-through' }}>₹{payInfo.asked} LPA</div>
                      </div>
                      <div style={{ fontSize:'1.4rem', color:'rgba(255,255,255,0.2)' }}>→</div>
                      <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:'0.65rem', color:'rgba(255,255,255,0.4)', marginBottom:3 }}>Realistic Offer</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:900, color:'#f87171' }}>₹{payInfo.realistic} LPA</div>
                      </div>
                      <p style={{ flex:1, minWidth:160, fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', lineHeight:1.5, margin:0 }}>
                        At {score}% ATS score, companies will offer significantly below your expectation.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer CTA */}
              <div style={{ padding:'0 28px 24px', display:'flex', gap:10 }}>
                <button
                  onClick={() => { setShowReality(false); setTab('results'); }}
                  style={{
                    flex:1, padding:'13px', borderRadius:12, border:'none', cursor:'pointer',
                    background:'linear-gradient(135deg,#4f46e5,#7c3aed)',
                    color:'white', fontWeight:700, fontSize:'0.9rem',
                    boxShadow:'0 4px 20px rgba(99,102,241,0.4)',
                  }}
                >
                  See My Full Report →
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoImg} alt="Logo" style={{ width: 38, height: 38, objectFit: 'contain', borderRadius: 8 }} />
            <span>ATS Checker <span style={{ color: 'var(--accent)' }}>Pro</span></span>
          </Link>
          <div className="navbar-actions">
            <span style={{ fontSize: '0.875rem', color: 'var(--text-2)' }}>Hello, <strong style={{ color: 'var(--text-1)' }}>{user?.name?.split(' ')[0]}</strong></span>
            <button className="btn-outline-white btn-sm" onClick={async () => { await account.deleteSession('current'); setUser(null); navigate('/login'); }}>Sign out</button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 1140 }}>

        {/* ─── Page Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Resume Dashboard</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Upload, analyze, and improve your resume to pass ATS filters.</p>
          </div>
          <div className="tabs">
            {[['upload','⬆ New Analysis'],['results','📊 Results'],['history','🕑 History']].map(([k,l]) => (
              <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>
        </div>

        {/* ─── Upload Tab ─── */}
        {tab === 'upload' && (
          <div className="anim-fade-up" style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1.5fr)', gap: 24 }}>

            {/* Drop Zone Card */}
            <div>
              <div className="card card-p" style={{ marginBottom: 20 }}>
                <h2 className="t-h3" style={{ marginBottom: 4 }}>Upload Resume</h2>
                <p className="t-sm" style={{ marginBottom: 20 }}>PDF format only, max 10 MB.</p>
                <div
                  className={`drop-zone ${dragging ? 'active' : ''}`}
                  onClick={() => fileRef.current.click()}
                  onDragOver={e => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                >
                  {file ? (
                    <div>
                      <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', marginBottom: 4 }}>{file.name}</div>
                      <div className="t-xs">{(file.size/1024).toFixed(1)} KB · PDF</div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: '2.4rem', marginBottom: 10 }}>📂</div>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-2)', marginBottom: 4 }}>Drag & drop your PDF here</div>
                      <div className="t-xs">or click to browse files</div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} style={{ display: 'none' }} />
                </div>
                {file && (
                  <button className="btn btn-ghost btn-sm" style={{ marginTop: 12, width: '100%' }} onClick={() => setFile(null)}>
                    × Remove file
                  </button>
                )}
              </div>

              <div className="card" style={{ padding: '16px 20px', background: 'var(--accent-light)', border: '1px solid #c7d2fe' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--accent)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
                  💡 <strong>Tip:</strong> Add a job description in the form to get role-specific keyword analysis and much higher accuracy.
                </p>
              </div>
            </div>

            {/* Options Form */}
            <form className="card card-p" onSubmit={handleAnalyze}>
              <h2 className="t-h3" style={{ marginBottom: 4 }}>Analysis Options</h2>
              <p className="t-sm" style={{ marginBottom: 24 }}>Optional fields — adding them significantly improves accuracy.</p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Target Role</label>
                  <input className="form-control" name="targetRole" placeholder="e.g. Software Engineer" value={fields.targetRole} onChange={setField} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input className="form-control" name="company" placeholder="e.g. Google, Amazon" value={fields.company} onChange={setField} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Expected Pay Scale</label>
                  <input className="form-control" name="payScale" placeholder="e.g. ₹8–12 LPA" value={fields.payScale} onChange={setField} />
                </div>
                <div className="form-group">
                  <label className="form-label">Experience Level</label>
                  <select className="form-control" name="experienceLevel" value={fields.experienceLevel} onChange={setField}>
                    {['Entry-Level','Mid-Level','Senior','Executive'].map(l => <option key={l}>{l}</option>)}
                  </select>
                </div>
              </div>



              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label">Job Description</label>
                <textarea className="form-control" name="jobDescription" rows={6} placeholder="Paste the full job description here for the most accurate keyword matching..." value={fields.jobDescription} onChange={setField} />
              </div>

              <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading || !file}>
                {loading
                  ? <><span className="spinner" /> {statusText || 'Analyzing...'}</>
                  : '⚡ Analyze My Resume'
                }
              </button>
              {!file && <p className="t-xs" style={{ textAlign: 'center', marginTop: 10 }}>Upload a PDF to enable analysis</p>}
            </form>
          </div>
        )}

        {/* ─── Results Tab ─── */}
        {tab === 'results' && (
          <div className="anim-fade-up">
            {!result ? (
              <div className="card" style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
                <h2 className="t-h2" style={{ marginBottom: 10 }}>No results yet</h2>
                <p className="t-sm" style={{ marginBottom: 24 }}>Upload and analyze a resume to see your full report here.</p>
                <button className="btn btn-primary" onClick={() => setTab('upload')}>Go to Upload</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

                {/* Score Summary */}
                <div className="card card-p">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <h2 className="t-h2" style={{ marginBottom: 4 }}>ATS Analysis Report</h2>
                      <p className="t-sm">{result.fileName} {result.targetRole && `· Target: ${result.targetRole}`}</p>
                    </div>
                    {result.fileUrl && (
                      <a href={result.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                        ↓ Download Resume
                      </a>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                    <ScoreRing score={result.atsData.overallScore} size={120} stroke={10} color={scoreColor(result.atsData.overallScore)} label="ATS Score" />
                    <ScoreRing score={result.atsData.keywordMatchScore} size={96} stroke={8} color="var(--accent)" label="Keywords" />
                    <ScoreRing score={result.atsData.readabilityScore} size={96} stroke={8} color="#0284c7" label="Readability" />
                    <div style={{ flex: 1, minWidth: 240, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                      {[
                        { label: 'ATS Compatibility', val: result.atsData.overallScore, color: scoreColor(result.atsData.overallScore) },
                        { label: 'Keyword Match', val: result.atsData.keywordMatchScore, color: 'var(--accent)' },
                        { label: 'Readability', val: result.atsData.readabilityScore, color: '#0284c7' },
                      ].map((b, i) => (
                        <div key={i} style={{ marginBottom: i < 2 ? 14 : 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                            <span className="t-sm" style={{ fontWeight: 500 }}>{b.label}</span>
                            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: b.color }}>{b.val}%</span>
                          </div>
                          <div className="progress">
                            <div className="progress-fill" style={{ width: `${b.val}%`, background: b.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Score Breakdown */}
                {result.atsData.scoreBreakdown && (
                  <div className="card card-p">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
                      <div>
                        <h3 className="t-h3" style={{ marginBottom: 4 }}>Score Breakdown</h3>
                        <p className="t-sm">How each component contributes to your final ATS score.</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        <span className="badge badge-accent">Algorithm: {result.atsData.algoScore}%</span>
                        <span className="badge badge-gray">AI Estimate: {result.atsData.aiScore}%</span>
                        <span className="badge badge-success">Final: {result.atsData.overallScore}%</span>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 16 }}>
                      {[
                        { label: 'Keyword Match', val: result.atsData.scoreBreakdown.keywordMatch, weight: '35%', color: 'var(--accent)' },
                        { label: 'Skills Match',  val: result.atsData.scoreBreakdown.skillsMatch,  weight: '25%', color: '#7c3aed' },
                        { label: 'Experience',    val: result.atsData.scoreBreakdown.experience,   weight: '20%', color: '#0891b2' },
                        { label: 'Sections',      val: result.atsData.scoreBreakdown.sections,     weight: '12%', color: '#059669' },
                        { label: 'Format',        val: result.atsData.scoreBreakdown.format,       weight: '8%',  color: '#d97706' },
                      ].map((b, i) => (
                        <div key={i} style={{ padding: '14px 16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-2)' }}>{b.label}</span>
                            <span style={{ fontSize: '0.68rem', color: 'var(--text-4)', fontWeight: 600 }}>{b.weight}</span>
                          </div>
                          <div style={{ fontSize: '1.5rem', fontWeight: 900, color: b.color, marginBottom: 8, lineHeight: 1 }}>{b.val}%</div>
                          <div className="progress">
                            <div className="progress-fill" style={{ width: `${b.val}%`, background: b.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills & Suggestions Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="card card-p">
                    <h3 className="t-h3" style={{ marginBottom: 4 }}>Missing Skills & Keywords</h3>
                    <p className="t-sm" style={{ marginBottom: 16 }}>Add these to improve your keyword match score.</p>
                    <div>
                      {result.atsData.missingSkills?.length > 0
                        ? result.atsData.missingSkills.map((s, i) => <span key={i} className="skill-tag">{s}</span>)
                        : <div className="alert alert-success">✓ No critical keyword gaps detected.</div>
                      }
                    </div>
                  </div>

                  <div className="card card-p">
                    <h3 className="t-h3" style={{ marginBottom: 4 }}>Improvement Suggestions</h3>
                    <p className="t-sm" style={{ marginBottom: 16 }}>AI-generated, prioritized recommendations.</p>
                    <ol style={{ paddingLeft: 20, margin: 0 }}>
                      {result.atsData.suggestions?.map((s, i) => (
                        <li key={i} style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: 10, lineHeight: 1.6 }}>{s}</li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Section Analysis */}
                <div className="card card-p">
                  <h3 className="t-h3" style={{ marginBottom: 4 }}>Section-by-Section Analysis</h3>
                  <p className="t-sm" style={{ marginBottom: 20 }}>Detailed feedback for each part of your resume.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
                    {Object.entries(result.atsData.sectionAnalysis || {}).map(([sec, txt]) => (
                      <div key={sec} style={{ padding: '16px', background: 'var(--bg)', borderRadius: 10, border: '1px solid var(--border)' }}>
                        <div className="t-label" style={{ marginBottom: 8, color: 'var(--accent)' }}>{sec}</div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>{txt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Role Recommendations */}
                {result.atsData.roleRecommendations?.length > 0 && (
                  <div className="card card-p">
                    <h3 className="t-h3" style={{ marginBottom: 14 }}>Recommended Job Roles</h3>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                      {result.atsData.roleRecommendations.map((r, i) => (
                        <span key={i} className="badge badge-accent" style={{ fontSize: '0.82rem', padding: '6px 14px' }}>{r}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* ─── Ad Banner at bottom of Results (1:1 Ratio, Small Container) ─── */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: 10 }}>
                  <div style={{
                    width: '100%',
                    maxWidth: '300px',
                    aspectRatio: '1/1',
                    borderRadius: 16,
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: 'var(--shadow-sm)'
                  }}>
                    <div style={{
                      position: 'absolute', top: 10, left: 12, zIndex: 2,
                      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
                      padding: '2px 10px', borderRadius: 20,
                      fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.65)',
                      letterSpacing: '0.08em', textTransform: 'uppercase',
                    }}>Sponsored</div>
                    <video
                      src="/1779108389699.mp4"
                      autoPlay loop muted playsInline
                      style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ─── History Tab ─── */}
        {tab === 'history' && (
          <div className="anim-fade-up">
            <div className="card" style={{ overflow: 'hidden' }}>
              <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <h2 className="t-h2" style={{ marginBottom: 2 }}>Analysis History</h2>
                  <p className="t-sm">{history.length} resumes analyzed in your account.</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setTab('upload')}>+ New Analysis</button>
              </div>

              {historyLoading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <span className="spinner spinner-accent" style={{ width: 28, height: 28 }} />
                </div>
              ) : history.length === 0 ? (
                <div style={{ padding: '64px 40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '2.4rem', marginBottom: 12 }}>📭</div>
                  <h3 className="t-h3" style={{ marginBottom: 8 }}>No analyses yet</h3>
                  <p className="t-sm" style={{ marginBottom: 20 }}>Upload your first resume to see your history here.</p>
                  <button className="btn btn-primary btn-sm" onClick={() => setTab('upload')}>Analyze a Resume</button>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>File Name</th>
                        <th>Role Applied</th>
                        <th>Company</th>
                        <th>Pay Scale</th>
                        <th>ATS Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(item => (
                        <tr key={item.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-1)', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.fileName}</td>
                          <td>{item.role || item.targetRole || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                          <td>{item.company || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                          <td>{item.payScale || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                          <td>
                            <span className={`badge ${item.overallScore >= 75 ? 'badge-success' : item.overallScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                              {item.overallScore}%
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => {
                                const parsed = { ...item, atsData: typeof item.atsData === 'string' ? JSON.parse(item.atsData) : item.atsData };
                                setResult(parsed); setTab('results');
                              }}>View Report</button>
                              {item.fileUrl && <a href={item.fileUrl} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ textDecoration: 'none' }}>PDF ↗</a>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
