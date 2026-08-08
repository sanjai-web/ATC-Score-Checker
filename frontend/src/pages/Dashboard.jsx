import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
        <div style={{ fontSize: size === 120 ? '1.8rem' : '1.1rem', fontWeight: 900, color: 'var(--text-1)' }}>{score}%</div>
        {label && <div style={{ fontSize: '0.62rem', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>}
      </div>
    </div>
  );
}

const scoreColor = s => s >= 75 ? '#059669' : s >= 50 ? '#d97706' : '#dc2626';

function Dashboard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [tab, setTab] = useState('upload'); // 'upload' or 'results'
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [fields, setFields] = useState({
    fullName: '',
    mobile: '',
    email: '',
    degree: '',
    department: '',
    college: '',
    graduationYear: '',
    currentStatus: '',
    targetRole: '',
    company: '',
    jobDescription: ''
  });

  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('');
  const [result, setResult] = useState(null);
  const [showAd, setShowAd] = useState(false);
  const [showReality, setShowReality] = useState(false);
  
  const fileRef = useRef();
  const videoRef = useRef();

  const setField = e => {
    setFormError('');
    setFields(p => ({ ...p, [e.target.name]: e.target.value }));
  };

  const handleDrop = e => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') {
      setFile(f);
      setFormError('');
    } else {
      alert('Please upload a PDF file only.');
    }
  };

  const handleNextStep = () => {
    const { fullName, degree, department, college, graduationYear, currentStatus } = fields;
    if (!fullName.trim()) return setFormError('Full Name is required.');
    if (!degree.trim()) return setFormError('Degree is required.');
    if (!department.trim()) return setFormError('Department is required.');
    if (!college.trim()) return setFormError('College is required.');
    if (!graduationYear.trim()) return setFormError('Graduation Year is required.');
    if (!currentStatus) return setFormError('Please select your Current Status.');
    
    setStep(2);
    setFormError('');
  };

  const handlePrevStep = () => {
    setStep(1);
    setFormError('');
  };

  const handleAnalyze = async e => {
    e.preventDefault();
    if (!file) return setFormError('Please select a PDF resume to analyze.');
    
    setLoading(true);
    setResult(null);
    setShowAd(true);
    setFormError('');

    try {
      setStatusText('Parsing resume...');
      const fd = new FormData();
      fd.append('resume', file);
      
      // Append all form fields
      Object.entries(fields).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      setStatusText('Analyzing with AI (this may take 10–20 seconds)...');
      const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/analyze`, fd);

      setStatusText('Saving scan report...');
      
      const docData = {
        userName: fields.fullName,
        userEmail: fields.email,
        userMobile: fields.mobile,
        degree: fields.degree,
        department: fields.department,
        college: fields.college,
        graduationYear: fields.graduationYear,
        currentStatus: fields.currentStatus,
        fileName: file.name,
        fileUrl: data.fileUrl,
        targetRole: fields.targetRole,
        company: fields.company,
        jobDescription: fields.jobDescription,
        overallScore: data.data.overallScore,
        createdAt: new Date().toISOString(),
        atsData: data.data
      };

      setResult(docData);
      setShowAd(false);
      setShowReality(true);
    } catch(err) {
      console.error(err);
      setShowAd(false);
      const detail = err.response?.data?.details || err.response?.data?.error || err.message;
      alert(`Analysis failed.\n\nError: ${detail}`);
    }
    setLoading(false);
    setStatusText('');
  };

  const resetForm = () => {
    setFields({
      fullName: '',
      mobile: '',
      email: '',
      degree: '',
      department: '',
      college: '',
      graduationYear: '',
      currentStatus: '',
      targetRole: '',
      company: '',
      jobDescription: ''
    });
    setFile(null);
    setStep(1);
    setResult(null);
    setTab('upload');
    setFormError('');
  };

  const getRating = s => s >= 80 ? { face:'😄', label:'Good', color:'#16a34a' }
    : s >= 60 ? { face:'😐', label:'Medium', color:'#d97706' }
    : s >= 40 ? { face:'😟', label:'Poor', color:'#ea580c' }
    : { face:'😣', label:'Very Bad', color:'#dc2626' };

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
            <div style={{
              position: 'absolute', top: 12, left: 14, zIndex: 2,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
              padding: '3px 10px', borderRadius: 20,
              fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>Ad</div>

            <video
              ref={videoRef}
              src="/1779108389699.mp4"
              autoPlay
              loop
              muted
              playsInline
              style={{ width: '100%', display: 'block', height: 'auto', maxHeight: '75vh' }}
            />

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#6366f1', display: 'inline-block', animation: 'pulse 1.2s infinite' }} />
                <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                  {statusText || 'Analyzing your resume with AI…'}
                </span>
              </div>
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
        const score = result.overallScore;
        const rating = getRating(score);
        const missing = result.atsData.missingSkills?.slice(0, 6) || [];
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

              <div style={{ padding:'20px 28px', display:'flex', flexDirection:'column', gap:14 }}>
                <div style={{ background:'rgba(220,38,38,0.1)', border:'1px solid rgba(220,38,38,0.25)', borderRadius:12, padding:'14px 16px' }}>
                  <div style={{ fontSize:'0.72rem', fontWeight:700, color:'#f87171', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:6 }}>⚠ Company Fit</div>
                  <p style={{ fontSize:'0.875rem', color:'rgba(255,255,255,0.8)', lineHeight:1.6, margin:0 }}>
                    With a score of <strong style={{color:'#f87171'}}>{score}%</strong>, you have roughly a <strong style={{color:'#f87171'}}>{chancePct}% chance</strong> of getting a callback from <strong style={{color:'white'}}>{company}</strong>. Most top companies shortlist only candidates scoring <strong style={{color:'white'}}>above 75%</strong>.
                  </p>
                </div>

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
              </div>

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
        <div className="container navbar-inner" style={{ justifyContent: 'space-between' }}>
          <Link to="/" className="navbar-logo" style={{ textDecoration: 'none', color: 'var(--text-1)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoImg} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8 }} />
            <span style={{ fontWeight: 800 }}>TECH VEDHU <span style={{ color: 'var(--accent)' }}>ATS</span></span>
          </Link>
          <div className="navbar-actions">
            <Link to="/" className="btn-outline-white btn-sm" style={{ textDecoration: 'none', display: 'inline-block' }}>Back to Home</Link>
          </div>
        </div>
      </nav>

      <div className="container" style={{ padding: '40px 24px', maxWidth: 1140 }}>

        {/* ─── Page Header ─── */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>ATS Resume Scanner</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Optimize your resume with our AI-powered analyzer.</p>
          </div>
          <div className="tabs">
            <button className={`tab-btn ${tab === 'upload' ? 'active' : ''}`} onClick={() => setTab('upload')}>
              {result ? '⚡ Change Candidate / Scan Again' : '⚡ Resume Scanner'}
            </button>
            {result && (
              <button className={`tab-btn ${tab === 'results' ? 'active' : ''}`} onClick={() => setTab('results')}>
                📊 View Results
              </button>
            )}
          </div>
        </div>

        {/* ─── Form / Upload Tab ─── */}
        {tab === 'upload' && (
          <div className="anim-fade-up" style={{ maxWidth: 800, marginInline: 'auto' }}>
            
            {/* Step Progress Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: step === 1 ? 'var(--gradient)' : 'var(--success)', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '0.875rem', fontWeight: 700
                }}>
                  {step === 1 ? '1' : '✓'}
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase' }}>Step 1 of 2</span>
                  <span style={{ fontSize: '0.85rem', color: step === 1 ? 'var(--text-1)' : 'var(--text-3)', fontWeight: 700 }}>Personal Details</span>
                </div>
              </div>
              <div style={{ flex: 1, height: 2, background: 'var(--border)', marginInline: 16 }} />
              <div style={{ display: 'flex', gap: 8 }}>
                <span style={{ 
                  width: 32, height: 32, borderRadius: '50%', 
                  background: step === 2 ? 'var(--gradient)' : 'var(--bg-3)', 
                  color: step === 2 ? 'white' : 'var(--text-4)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '0.875rem', fontWeight: 700
                }}>
                  2
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-4)', fontWeight: 600, textTransform: 'uppercase' }}>Step 2 of 2</span>
                  <span style={{ fontSize: '0.85rem', color: step === 2 ? 'var(--text-1)' : 'var(--text-4)', fontWeight: 700 }}>Job Details & Resume</span>
                </div>
              </div>
            </div>

            {formError && (
              <div className="alert alert-error" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, background: 'var(--danger-bg)', border: '1px solid var(--danger-bd)', color: 'var(--danger)', padding: '12px 16px', borderRadius: 10, fontSize: '0.875rem' }}>
                <span>⚠️</span>
                <strong>{formError}</strong>
              </div>
            )}

            {/* Step 1 Form */}
            {step === 1 && (
              <div className="card card-p anim-fade-in" style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="t-h3" style={{ marginBottom: 6, fontSize: '1.2rem' }}>Candidate Information</h2>
                <p className="t-sm" style={{ marginBottom: 24 }}>Please enter your personal details below to initialize your scan profile.</p>
                
                <div className="form-group" style={{ marginBottom: 18 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Full Name <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <input className="form-control" name="fullName" placeholder="Enter your full name" value={fields.fullName} onChange={setField} required />
                </div>

                <div className="grid-cols-2" style={{ marginBottom: 18 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Mobile Number</label>
                    <input className="form-control" name="mobile" placeholder="Enter your mobile number" value={fields.mobile} onChange={setField} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Email Address</label>
                    <input className="form-control" type="email" name="email" placeholder="Enter your email address" value={fields.email} onChange={setField} />
                  </div>
                </div>

                <div className="grid-cols-2" style={{ marginBottom: 18 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Degree <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" name="degree" placeholder="e.g. B.Tech, MCA, MBA" value={fields.degree} onChange={setField} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Department <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" name="department" placeholder="e.g. Computer Science" value={fields.department} onChange={setField} required />
                  </div>
                </div>

                <div className="grid-cols-3" style={{ marginBottom: 24 }}>
                  <div className="form-group" style={{ gridColumn: 'span 2' }}>
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>College / University <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" name="college" placeholder="Enter your college name" value={fields.college} onChange={setField} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Graduation Year <span style={{ color: 'var(--danger)' }}>*</span></label>
                    <input className="form-control" name="graduationYear" placeholder="e.g. 2026" value={fields.graduationYear} onChange={setField} required />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 30 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Current Status <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <select className="form-control" name="currentStatus" value={fields.currentStatus} onChange={setField} required>
                    <option value="" disabled>Select your current status</option>
                    <option value="Student">Student</option>
                    <option value="Fresher">Fresher / Graduate</option>
                    <option value="Working">Employed / Working</option>
                    <option value="Unemployed">Unemployed</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="btn btn-primary btn-lg" onClick={handleNextStep}>
                    Next Step: Job & Resume →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 Form */}
            {step === 2 && (
              <form className="card card-p anim-fade-in" onSubmit={handleAnalyze} style={{ boxShadow: 'var(--shadow-md)' }}>
                <h2 className="t-h3" style={{ marginBottom: 6, fontSize: '1.2rem' }}>Job Target & Resume PDF</h2>
                <p className="t-sm" style={{ marginBottom: 24 }}>Upload your resume and provide details on the role you are targeting.</p>

                <div className="grid-cols-2" style={{ marginBottom: 18 }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Target Role</label>
                    <input className="form-control" name="targetRole" placeholder="e.g. Frontend Developer" value={fields.targetRole} onChange={setField} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Company Name</label>
                    <input className="form-control" name="company" placeholder="e.g. Tech Vedhu" value={fields.company} onChange={setField} />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: 20 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Job Description</label>
                  <textarea className="form-control" name="jobDescription" rows={5} placeholder="Paste the job description here for accurate ATS scoring and match report..." value={fields.jobDescription} onChange={setField} />
                </div>

                <div className="form-group" style={{ marginBottom: 28 }}>
                  <label className="form-label" style={{ fontWeight: 700, color: 'var(--text-2)' }}>Resume Upload (PDF only) <span style={{ color: 'var(--danger)' }}>*</span></label>
                  <div
                    className={`drop-zone ${dragging ? 'active' : ''}`}
                    onClick={() => fileRef.current.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    style={{ minHeight: 140 }}
                  >
                    {file ? (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📄</div>
                        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent)', marginBottom: 4 }}>{file.name}</div>
                        <div className="t-xs">{(file.size/1024).toFixed(1)} KB · PDF</div>
                      </div>
                    ) : (
                      <div>
                        <div style={{ fontSize: '2rem', marginBottom: 10 }}>📤</div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-2)', marginBottom: 4 }}>Drag & drop your PDF resume here</div>
                        <div className="t-xs">or click to browse local files</div>
                      </div>
                    )}
                    <input ref={fileRef} type="file" accept=".pdf" onChange={e => {
                      if (e.target.files[0]) {
                        setFile(e.target.files[0]);
                        setFormError('');
                      }
                    }} style={{ display: 'none' }} />
                  </div>
                  {file && (
                    <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 10, width: '100%' }} onClick={() => setFile(null)}>
                      ✕ Remove uploaded file
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <button type="button" className="btn btn-secondary btn-lg" onClick={handlePrevStep}>
                    ← Back to Step 1
                  </button>
                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !file}>
                    {loading
                      ? <><span className="spinner" style={{ marginRight: 8 }} /> Analyzing...</>
                      : '⚡ Start ATS Scan'
                    }
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* ─── Results Tab ─── */}
        {tab === 'results' && (
          <div className="anim-fade-up">
            {!result ? (
              <div className="card" style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>📊</div>
                <h2 className="t-h2" style={{ marginBottom: 10 }}>No Results Found</h2>
                <p className="t-sm" style={{ marginBottom: 24 }}>Please complete steps 1 and 2 to view your ATS score analysis report.</p>
                <button className="btn btn-primary" onClick={() => setTab('upload')}>Go to Scanner</button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: '1 1 600px', minWidth: 0 }}>

                  {/* Score Summary */}
                  <div className="card card-p">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
                      <div>
                        <h2 className="t-h2" style={{ marginBottom: 4 }}>ATS Score Report</h2>
                        <p className="t-sm">Candidate: <strong>{result.userName}</strong> {result.targetRole && `· Target: ${result.targetRole}`}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 10 }}>
                        {result.fileUrl && (
                          <a href={result.fileUrl} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm" style={{ textDecoration: 'none' }}>
                            ↓ View Uploaded PDF
                          </a>
                        )}
                        <button className="btn btn-primary btn-sm" onClick={resetForm}>
                          Scan New Resume
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 32, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                      <ScoreRing score={result.overallScore} size={120} stroke={10} color={scoreColor(result.overallScore)} label="ATS Score" />
                      <ScoreRing score={result.atsData.keywordMatchScore} size={96} stroke={8} color="var(--accent)" label="Keywords" />
                      <ScoreRing score={result.atsData.readabilityScore} size={96} stroke={8} color="#0284c7" label="Readability" />
                      <div style={{ flex: 1, minWidth: 240, paddingLeft: 16, borderLeft: '1px solid var(--border)' }}>
                        {[
                          { label: 'ATS Compatibility', val: result.overallScore, color: scoreColor(result.overallScore) },
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
                          <span className="badge badge-success">Final: {result.overallScore}%</span>
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
                  <div className="grid-cols-2">
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

                {/* ─── Ad Banner (Right Side) ─── */}
                <div style={{ 
                  flex: '1 1 250px', 
                  maxWidth: '300px', 
                  width: '100%', 
                  position: 'sticky', 
                  top: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: 16 
                }}>
                  <div style={{
                    width: '100%',
                    position: 'relative',
                    borderRadius: 16,
                    overflow: 'hidden',
                    border: '1px solid rgba(99,102,241,0.2)',
                    boxShadow: 'var(--shadow-sm)',
                    background: '#000',
                  }}>
                    <div style={{
                      position: 'absolute', top: 7, left: 9, zIndex: 2,
                      background: 'rgba(0,0,0,0.45)',
                      padding: '1px 7px', borderRadius: 20,
                      fontSize: '0.58rem', fontWeight: 600,
                      color: 'rgba(255,255,255,0.5)',
                      letterSpacing: '0.06em', textTransform: 'uppercase',
                    }}>Sponsored</div>
                    <video
                      src="/1779108389699.mp4"
                      autoPlay loop muted playsInline
                      style={{
                        width: '100%',
                        display: 'block',
                        height: 'auto'
                      }}
                    />
                  </div>
                </div>

              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;