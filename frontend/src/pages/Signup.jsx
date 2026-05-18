import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

const TechVedhuLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C20 4 8 10 8 22C8 28 12 33 18 35L20 28L22 35C28 33 32 28 32 22C32 10 20 4 20 4Z" fill="white" opacity="0.9"/>
    <path d="M20 4C20 4 14 14 16 22L20 18L24 22C26 14 20 4 20 4Z" fill="white"/>
    <circle cx="17" cy="14" r="1.5" fill="#1a3b82"/>
  </svg>
);

export default function Signup() {
  const [form, setForm] = useState({ name: '', email: '', mobile: '', password: '', terms: false });
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
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name });
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid, name: form.name, email: form.email,
        mobile: form.mobile, createdAt: new Date().toISOString(), role: 'user',
      });
      navigate('/dashboard');
    } catch {
      setError('Could not create account. This email may already be registered.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, textDecoration: 'none', background: 'var(--navy)', padding: '10px 20px', borderRadius: 10 }}>
            <TechVedhuLogo size={30} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'white', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.03em' }}>TECH VEDHU</div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>ATS Checker</div>
            </div>
          </Link>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.025em', marginTop: 28, marginBottom: 6, color: 'var(--text-1)' }}>Create your free account</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-3)' }}>Start getting better interview opportunities today.</p>
        </div>

        <div className="card" style={{ padding: '36px 40px' }}>
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
              <label className="form-label">Password</label>
              <input className="form-control" name="password" type="password" required minLength={6} placeholder="Minimum 6 characters" value={form.password} onChange={set} />
            </div>

            <label className="checkbox-label" style={{ marginBottom: 28 }}>
              <input type="checkbox" name="terms" checked={form.terms} onChange={set} />
              <span>
                I accept the{' '}
                <span style={{ color: 'var(--accent)', fontWeight: 600, cursor: 'pointer' }}>Terms & Conditions</span>
                {' '}and consent to my uploaded resume and personal information being stored and used for analytics and service improvement purposes.
              </span>
            </label>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating your account...</> : 'Create Account →'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '0.875rem', color: 'var(--text-3)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
