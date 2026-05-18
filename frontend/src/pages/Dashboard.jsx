import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import axios from 'axios';

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

export default function Dashboard() {
  const [tab, setTab] = useState('upload');
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [fields, setFields] = useState({ targetRole: '', industry: '', experienceLevel: 'Entry-Level', jobDescription: '' });
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const fileRef = useRef();

  // Use state for user so auth.onAuthStateChanged always gives us a non-null user
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [userMobile, setUserMobile] = useState('');

  useEffect(() => {
    // onAuthStateChanged guarantees we have the real user (avoids null on first render)
    const unsubscribe = auth.onAuthStateChanged(u => {
      if (u) {
        setCurrentUser(u);
        // Fetch mobile number from users Firestore collection
        getDoc(doc(db, 'users', u.uid))
          .then(snap => { if (snap.exists()) setUserMobile(snap.data().mobile || ''); })
          .catch(() => {});
        fetchHistory(u);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchHistory = async (u) => {
    const uid = u?.uid || currentUser?.uid;
    if (!uid) return;
    setHistoryLoading(true);
    try {
      const q = query(collection(db, 'resumes'), where('userId','==',uid), orderBy('createdAt','desc'));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
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
    const user = currentUser;
    if (!user) return alert('You must be logged in to analyze a resume.');
    setLoading(true); setResult(null);
    try {
      setStatusText('Parsing resume...');
      const fd = new FormData();
      fd.append('resume', file);
      Object.entries(fields).forEach(([k, v]) => { if (v) fd.append(k, v); });

      setStatusText('Analyzing with AI (this may take 10–20 seconds)...');
      const { data } = await axios.post('http://localhost:5000/api/analyze', fd);

      setStatusText('Saving your results...');
      // Guaranteed mobile fetch at save time — handles race condition
      let mobile = userMobile;
      if (!mobile) {
        try {
          const userSnap = await getDoc(doc(db, 'users', user.uid));
          if (userSnap.exists()) mobile = userSnap.data().mobile || '';
        } catch (_) {}
      }

      const docData = {
        userId: user.uid, userName: user.displayName, userEmail: user.email,
        userMobile: mobile,
        fileName: file.name, fileUrl: data.fileUrl, storageProvider: 'cloudinary',
        targetRole: fields.targetRole, industry: fields.industry,
        overallScore: data.data.overallScore,
        createdAt: new Date().toISOString(), atsData: data.data,
      };
      await addDoc(collection(db, 'resumes'), docData);
      setResult(docData);
      fetchHistory(user);
      setTab('results');
    } catch(err) {
      console.error(err);
      alert('Analysis failed. Please make sure the backend server is running at http://localhost:5000');
    }
    setLoading(false); setStatusText('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

      {/* ─── Navbar ─── */}
      <nav className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', color: 'var(--text-1)' }}>
            <div className="navbar-logo-icon">A</div>
            <span>ATS Checker <span style={{ color: 'var(--accent)' }}>Pro</span></span>
          </Link>
          <div className="navbar-actions">
            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>Hello, <strong style={{ color: 'white' }}>{currentUser?.displayName?.split(' ')[0]}</strong></span>
            <button className="btn-outline-white btn-sm" onClick={() => signOut(auth)}>Sign out</button>
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
                  <label className="form-label">Industry</label>
                  <input className="form-control" name="industry" placeholder="e.g. Technology" value={fields.industry} onChange={setField} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Experience Level</label>
                <select className="form-control" name="experienceLevel" value={fields.experienceLevel} onChange={setField}>
                  {['Entry-Level','Mid-Level','Senior','Executive'].map(l => <option key={l}>{l}</option>)}
                </select>
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
                        <th>Target Role</th>
                        <th>ATS Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map(item => (
                        <tr key={item.id}>
                          <td style={{ whiteSpace: 'nowrap' }}>{new Date(item.createdAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                          <td style={{ fontWeight: 600, color: 'var(--text-1)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.fileName}</td>
                          <td>{item.targetRole || <span style={{ color: 'var(--text-4)' }}>—</span>}</td>
                          <td>
                            <span className={`badge ${item.overallScore >= 75 ? 'badge-success' : item.overallScore >= 50 ? 'badge-warning' : 'badge-danger'}`}>
                              {item.overallScore}%
                            </span>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => { setResult(item); setTab('results'); }}>View Report</button>
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
