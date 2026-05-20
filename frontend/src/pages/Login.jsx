import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account } from '../appwrite';

const Logo = ({ size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 7v5c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V7L12 2z" fill="white" opacity="0.9"/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

export default function Login({ setUser }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await account.createEmailPasswordSession(email, password);
      const u = await account.get();
      setUser(u);
      navigate('/dashboard');
    } catch {
      setError('Incorrect email or password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--bg)' }}>

      {/* ── Left Panel ── */}
      <div style={{ position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '48px 56px', background: 'linear-gradient(145deg, #4f46e5 0%, #7c3aed 100%)' }}>
        {/* BG orbs */}
        <div className="hero-orb" style={{ width: 500, height: 500, background: '#6366f1', top: -180, left: -120 }} />
        <div className="hero-orb" style={{ width: 300, height: 300, background: '#8b5cf6', bottom: -80, right: -60, opacity: 0.3 }} />

        {/* Grid overlay */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)', backgroundSize: '40px 40px', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ position: 'relative' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 72, textDecoration: 'none' }}>
            <Logo size={40} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em' }}>TECH VEDHU</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ATS Checker</div>
            </div>
          </Link>

          <h2 style={{ color: 'white', fontSize: 'clamp(1.7rem,3vw,2.4rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 18, letterSpacing: '-0.025em' }}>
            Land more interviews<br />
            <span className="t-gradient">with a stronger resume.</span>
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 360 }}>
            Our AI analyzes your resume against any job description and tells you exactly what recruiters' ATS systems want to see.
          </p>
        </div>

        {/* Stats */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {[
            { v: '84%', l: 'Avg score improvement on first revision', icon: '📈' },
            { v: '3×', l: 'More interview callbacks reported by users', icon: '📞' },
            { v: '30s', l: 'Average time to get your full ATS report', icon: '⚡' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', borderRadius: 14, padding: '16px 20px' }}>
              <span style={{ fontSize: '1.4rem', flexShrink: 0 }}>{s.icon}</span>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'white', minWidth: 52, lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.85)', lineHeight: 1.5 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="anim-scale-in" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', background: 'var(--bg)', borderLeft: '1px solid var(--border)' }}>
        <div style={{ width: '100%', maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>Welcome back</h1>
            <p style={{ color: 'var(--text-3)', fontSize: '0.9rem' }}>Sign in to your dashboard to continue.</p>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email address</label>
              <input className="form-control" type="email" required placeholder="you@example.com"
                value={email} onChange={e => setEmail(e.target.value)} />
            </div>

            <div className="form-group" style={{ marginBottom: 28 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                <label className="form-label" style={{ margin: 0 }}>Password</label>
                <button type="button" style={{ fontSize: '0.78rem', color: 'var(--accent-hover)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                  onClick={() => setShowPass(p => !p)}>
                  {showPass ? 'Hide' : 'Show'} password
                </button>
              </div>
              <input className="form-control" type={showPass ? 'text' : 'password'} required
                placeholder="Your password" value={password} onChange={e => setPassword(e.target.value)} />
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : '→ Sign in to Dashboard'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '28px 0' }}>
            <div className="divider" style={{ flex: 1 }} />
            <span style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>or</span>
            <div className="divider" style={{ flex: 1 }} />
          </div>

          {/* What you get */}
          <div style={{ background: 'var(--accent-light)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '16px 18px', marginBottom: 24 }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent-hover)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>What you'll get</div>
            {['Instant ATS compatibility score', 'AI-powered keyword gap analysis', 'Section-by-section resume review', 'Role & title recommendations'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 3 ? 6 : 0 }}>
                <span style={{ color: 'var(--success)', fontWeight: 700, fontSize: '0.85rem' }}>✓</span>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-2)' }}>{item}</span>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-3)' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: 'var(--accent-hover)', fontWeight: 700, textDecoration: 'none' }}>Create one free →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
