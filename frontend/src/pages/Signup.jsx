import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { account, databases, DB_ID, USERS_COL, ID } from '../appwrite';

const Logo = ({ size = 36 }) => (
  <div style={{ width: size, height: size, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
      <path d="M12 2L4 7v5c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V7L12 2z" fill="white" opacity="0.9"/>
      <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  </div>
);

function StrengthBar({ password }) {
  const checks = [password.length >= 6, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const strength = checks.filter(Boolean).length;
  const colors = ['', '#f43f5e', '#f59e0b', '#6366f1', '#10b981'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? colors[strength] : 'var(--border)', transition: 'background 0.3s' }} />
        ))}
      </div>
      <span style={{ fontSize: '0.72rem', color: colors[strength], fontWeight: 600 }}>{labels[strength]}</span>
    </div>
  );
}

export default function Signup({ setUser }) {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', terms: false });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const set = e => {
    const { name, value, type, checked } = e.target;
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.terms) return setError('Please accept the Terms & Conditions to create your account.');
    setLoading(true); setError('');
    try {
      // 1. Create Appwrite auth account
      const created = await account.create(ID.unique(), form.email, form.password, form.name);
      // 2. Create session (log in immediately)
      await account.createEmailPasswordSession(form.email, form.password);
      // 3. Save user profile in Appwrite DB
      await databases.createDocument(DB_ID, USERS_COL, created.$id, {
        uid: created.$id, name: form.name, email: form.email,
        mobile: form.mobile, createdAt: new Date().toISOString(), role: 'user',
      });
      const u = await account.get();
      setUser(u);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Could not create account. This email may already be registered.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', position: 'relative', overflow: 'hidden' }}>
      {/* BG orbs */}
      <div className="hero-orb" style={{ width: 600, height: 600, background: '#6366f1', top: -200, right: -150 }} />
      <div className="hero-orb" style={{ width: 400, height: 400, background: '#8b5cf6', bottom: -150, left: -100, opacity: 0.25 }} />

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: 540 }}>

          {/* Logo Header */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none', background: 'var(--card)', border: '1px solid var(--glass-border)', padding: '10px 20px', borderRadius: 14, backdropFilter: 'blur(12px)', marginBottom: 28 }}>
              <Logo size={32} />
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em' }}>TECH VEDHU</div>
                <div style={{ color: 'var(--accent-hover)', fontSize: '0.62rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>ATS Checker</div>
              </div>
            </Link>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: 8 }}>Create your free account</h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Start getting better interview opportunities today.</p>
          </div>

          {/* Form Card */}
          <div className="card" style={{ padding: '36px 40px', backdropFilter: 'blur(20px)' }}>

            {/* Progress Steps */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 28 }}>
              {['Personal', 'Account', 'Terms'].map((step, i) => (
                <React.Fragment key={i}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 800, color: 'white', flexShrink: 0 }}>{i+1}</div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-3)' }}>{step}</span>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 8px' }} />}
                </React.Fragment>
              ))}
            </div>

            {error && <div className="alert alert-error">⚠ {error}</div>}

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-control" name="name" required placeholder="John Doe" value={form.name} onChange={set} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mobile Number</label>
                  <input className="form-control" name="mobile" type="tel" required placeholder="+91 98765 43210" value={form.mobile} onChange={set} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input className="form-control" name="email" type="email" required placeholder="you@example.com" value={form.email} onChange={set} />
              </div>

              <div className="form-group" style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 }}>
                  <label className="form-label" style={{ margin: 0 }}>Password</label>
                  <button type="button" style={{ fontSize: '0.78rem', color: 'var(--accent-hover)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    onClick={() => setShowPass(p => !p)}>
                    {showPass ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input className="form-control" name="password" type={showPass ? 'text' : 'password'} required minLength={6}
                  placeholder="Minimum 6 characters" value={form.password} onChange={set} />
                <StrengthBar password={form.password} />
              </div>

              <label className="checkbox-label" style={{ marginBottom: 28, alignItems: 'flex-start' }}>
                <input type="checkbox" name="terms" checked={form.terms} onChange={set} style={{ marginTop: 3 }} />
                <span style={{ fontSize: '0.8rem', color: 'var(--text-3)', lineHeight: 1.6 }}>
                  I accept the{' '}
                  <span style={{ color: 'var(--accent-hover)', fontWeight: 600, cursor: 'pointer' }}>Terms & Conditions</span>
                  {' '}and consent to my uploaded resume and personal information being stored and used for analytics and service improvement.
                </span>
              </label>

              <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
                {loading ? <><span className="spinner" /> Creating your account...</> : 'Create Account →'}
              </button>
            </form>

            {/* Benefits */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 24 }}>
              {['Free forever', 'No credit card', 'Instant results', 'Secure & private'].map((b, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-4)' }}>
                  <span style={{ color: 'var(--success)' }}>✓</span> {b}
                </div>
              ))}
            </div>
          </div>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-3)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-hover)', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
