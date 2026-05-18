import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const TechVedhuLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C20 4 8 10 8 22C8 28 12 33 18 35L20 28L22 35C28 33 32 28 32 22C32 10 20 4 20 4Z" fill="white" opacity="0.9"/>
    <path d="M20 4C20 4 14 14 16 22L20 18L24 22C26 14 20 4 20 4Z" fill="white"/>
    <circle cx="17" cy="14" r="1.5" fill="#1a3b82"/>
  </svg>
);

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch {
      setError('Incorrect email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--white)' }}>

      {/* ─── Left Panel ─── */}
      <div style={{ background: 'var(--navy)', padding: '48px 56px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 340, height: 340, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -80, right: -80, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: 80, left: -60, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 80, textDecoration: 'none' }}>
            <TechVedhuLogo size={38} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.03em' }}>TECH VEDHU</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ATS Checker</div>
            </div>
          </Link>

          <h2 style={{ color: 'white', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 16, letterSpacing: '-0.025em' }}>
            Land more interviews<br />with a stronger resume.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.95rem', lineHeight: 1.7, maxWidth: 360 }}>
            Our AI analyzes your resume against any job description and tells you exactly what recruiters' ATS systems want to see.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {[
            { v: '84%', l: 'Avg score improvement on first revision' },
            { v: '3×', l: 'More interview callbacks reported by users' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'white', minWidth: 52 }}>{s.v}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.8)', lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="anim-scale-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: 'var(--bg)' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 6, color: 'var(--text-1)' }}>Welcome back</h1>
          <p style={{ color: 'var(--text-3)', fontSize: '0.9rem', marginBottom: 32 }}>Sign in to continue to your dashboard.</p>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-control" type="email" required placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Password</label>
              <input className="form-control" type="password" required placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign in to dashboard'}
            </button>
          </form>

          <div style={{ height: 1, background: 'var(--border)', margin: '28px 0' }} />

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
