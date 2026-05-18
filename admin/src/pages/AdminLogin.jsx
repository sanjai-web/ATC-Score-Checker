import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'admin';

const TechVedhuLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C20 4 8 10 8 22C8 28 12 33 18 35L20 28L22 35C28 33 32 28 32 22C32 10 20 4 20 4Z" fill="white" opacity="0.9"/>
    <path d="M20 4C20 4 14 14 16 22L20 18L24 22C26 14 20 4 20 4Z" fill="white"/>
    <circle cx="17" cy="14" r="1.5" fill="#1a3b82"/>
  </svg>
);

export default function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true); setError('');
    setTimeout(() => {
      if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('adminLoggedIn', 'true');
        navigate('/dashboard');
      } else {
        setError('Incorrect username or password. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex' }}>

      {/* ─── Left Accent Panel ─── */}
      <div style={{ width: 420, flexShrink: 0, background: 'var(--navy)', padding: '56px 48px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', width: 320, height: 320, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', top: -80, right: -60, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: 60, left: -60, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 64 }}>
            <TechVedhuLogo size={40} />
            <div>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem', letterSpacing: '0.03em' }}>TECH VEDHU</div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Panel</div>
            </div>
          </div>
          <h1 style={{ color: 'white', fontSize: '1.9rem', fontWeight: 900, lineHeight: 1.2, marginBottom: 14, letterSpacing: '-0.025em' }}>
            Manage users,<br />resumes & analytics.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem', lineHeight: 1.7, maxWidth: 300 }}>
            A centralized dashboard to monitor resume uploads, track users, and export business analytics.
          </p>
        </div>

        <div style={{ position: 'relative' }}>
          {[
            { icon: '👥', label: 'User Management', desc: 'View and search all registered users.' },
            { icon: '📊', label: 'Analytics & Charts', desc: 'Monitor daily uploads and score distribution.' },
            { icon: '📥', label: 'CSV Exports', desc: 'Download all user and resume data instantly.' },
          ].map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: i < 2 ? 16 : 0 }}>
              <div style={{ width: 34, height: 34, background: 'rgba(255,255,255,0.12)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '1.1rem' }}>{f.icon}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 700, fontSize: '0.875rem', marginBottom: 2 }}>{f.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.78rem', lineHeight: 1.5 }}>{f.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ─── Right Form Panel ─── */}
      <div className="anim-fade-in" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 6, color: 'var(--text-1)' }}>Sign in to Admin</h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Access the dashboard using your admin credentials.</p>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                className="form-control"
                type="text"
                required
                placeholder="Enter username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div className="form-group" style={{ marginBottom: 28 }}>
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                required
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Signing in...</> : 'Sign in to Dashboard →'}
            </button>
          </form>

          <div style={{ marginTop: 28, padding: '14px 16px', background: 'var(--accent-light)', border: '1px solid #bfdbfe', borderRadius: 10 }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--accent)', margin: 0, fontWeight: 500 }}>
              🔐 Default credentials — Username: <strong>admin</strong> · Password: <strong>admin</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
