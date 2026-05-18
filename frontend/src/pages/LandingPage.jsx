import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// TechVedhu Bird Logo SVG
const TechVedhuLogo = ({ size = 36 }) => (
  <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 4C20 4 8 10 8 22C8 28 12 33 18 35L20 28L22 35C28 33 32 28 32 22C32 10 20 4 20 4Z" fill="white" opacity="0.9"/>
    <path d="M20 4C20 4 14 14 16 22L20 18L24 22C26 14 20 4 20 4Z" fill="white"/>
    <circle cx="17" cy="14" r="1.5" fill="#1a3b82"/>
  </svg>
);

const features = [
  { icon: '📊', title: 'ATS Score Analysis', desc: 'Get an accurate compatibility score that tells you exactly how a recruiter\'s ATS will rank your resume.' },
  { icon: '🎯', title: 'Keyword Matching', desc: 'Instantly identify missing keywords from any job description. Know exactly what to add.' },
  { icon: '🤖', title: 'AI-Powered Suggestions', desc: 'Receive specific, actionable rewrites powered by Groq AI to strengthen every section.' },
  { icon: '📁', title: 'Resume History', desc: 'Track your score improvements across multiple uploads and see how your resume evolves.' },
  { icon: '📂', title: 'Section-by-Section Feedback', desc: 'Education, Experience, Skills, and Projects — reviewed and rated individually.' },
  { icon: '💡', title: 'Role Recommendations', desc: 'Discover which job titles best match your current resume profile.' },
];

const steps = [
  { num: '01', title: 'Upload Your Resume', desc: 'Drag and drop your PDF or click to browse. It takes under 5 seconds.' },
  { num: '02', title: 'Add a Job Description', desc: 'Paste a target job posting to get keyword-matched, role-specific analysis.' },
  { num: '03', title: 'Get Your ATS Report', desc: 'Receive a detailed score, missing keywords, and prioritized suggestions instantly.' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer at Infosys', text: 'My ATS score went from 48% to 82% in two revisions. I got 3 interview calls in the same week.', avatar: 'P' },
  { name: 'Arjun Mehta', role: 'Data Analyst at TCS', text: 'The keyword matching feature is incredible. It showed me exactly what was missing for each role I applied to.', avatar: 'A' },
  { name: 'Sneha Reddy', role: 'Product Manager at Wipro', text: 'The section-by-section breakdown is something no other free tool offers. Genuinely impressed.', avatar: 'S' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fn = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ background: 'var(--white)', color: 'var(--text-1)' }}>

      {/* ─── Navbar ─── */}
      <header className="navbar">
        <div className="container navbar-inner">
          <div className="navbar-logo">
            <div className="navbar-logo-icon">
              <TechVedhuLogo size={36} />
            </div>
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '0.02em' }}>
              TECH VEDHU <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500, fontSize: '0.85rem' }}>ATS</span>
            </span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
            <a href="#features" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.85)'}>Features</a>
            <a href="#how-it-works" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'rgba(255,255,255,0.85)', transition: 'color 0.15s' }} onMouseEnter={e => e.target.style.color='white'} onMouseLeave={e => e.target.style.color='rgba(255,255,255,0.85)'}>How it works</a>
          </nav>
          <div className="navbar-actions">
            <button className="btn-outline-white" onClick={() => navigate('/login')}>Log in</button>
            <button className="btn btn-sm" style={{ background: 'white', color: 'var(--navy)', fontWeight: 700 }} onClick={() => navigate('/signup')}>Get Started</button>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section style={{ padding: '80px 0 96px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 760, marginInline: 'auto' }}>
          <div className="section-pill anim-fade-up">✦ Free for everyone — no credit card required</div>
          <h1 className="t-hero anim-fade-up-1" style={{ marginBottom: 20 }}>
            Is Your Resume<br />
            <span style={{ color: 'var(--accent)' }}>Passing the ATS?</span>
          </h1>
          <p className="t-body anim-fade-up-2" style={{ fontSize: '1.1rem', maxWidth: 580, margin: '0 auto 40px', color: 'var(--text-2)' }}>
            Upload your resume and get an instant ATS compatibility score, keyword gap analysis, and AI-powered improvement suggestions — in under 30 seconds.
          </p>
          <div className="anim-fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/signup')}>
              Analyze My Resume Free →
            </button>
            <button className="btn btn-secondary btn-xl" onClick={() => navigate('/login')}>
              Sign in
            </button>
          </div>
          <p className="anim-fade-up-4" style={{ fontSize: '0.78rem', color: 'var(--text-4)', marginTop: 16 }}>
            PDF format only · Secured with Firebase · Results in &lt;30 seconds
          </p>
        </div>

        {/* Hero visual */}
        <div className="container anim-fade-up-4" style={{ marginTop: 64, maxWidth: 860 }}>
          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border)' }}>
            <div style={{ background: 'var(--navy)', padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 8 }}>
              {['#f87171','#fbbf24','#34d399'].map((c,i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>Tech Vedhu ATS — Dashboard</div>
            </div>
            <div style={{ padding: 32, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20, background: 'var(--bg)' }}>
              {[
                { label: 'ATS Score', value: 84, color: '#059669' },
                { label: 'Keyword Match', value: 71, color: 'var(--accent)' },
                { label: 'Readability', value: 91, color: 'var(--navy)' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '20px 16px', background: 'var(--white)', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '2.4rem', fontWeight: 900, color: s.color }}>{s.value}%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 4 }}>{s.label}</div>
                  <div className="progress" style={{ marginTop: 10 }}>
                    <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section style={{ padding: '52px 0', background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
        <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px,1fr))', gap: 0 }}>
          {[
            { value: '50,000+', label: 'Resumes Analyzed' },
            { value: '98%', label: 'ATS Accuracy Rate' },
            { value: '3×', label: 'More Interview Calls' },
            { value: '< 30s', label: 'Average Analysis Time' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '20px 16px', borderRight: i < 3 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ fontSize: '2rem', fontWeight: 900, color: 'var(--navy)', letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-3)', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="section" id="features" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-pill anim-fade-up">Everything you need</div>
            <h2 className="t-h1 anim-fade-up-1" style={{ marginBottom: 12 }}>A complete resume analysis toolkit</h2>
            <p className="t-body anim-fade-up-2" style={{ maxWidth: 480, marginInline: 'auto' }}>
              Every tool you need to turn a weak resume into one that passes ATS filters and impresses recruiters.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px,1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-lift" style={{ padding: '28px 28px 32px' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', marginBottom: 16 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8, color: 'var(--navy)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <div className="section-pill">Simple process</div>
            <h2 className="t-h1" style={{ marginBottom: 12 }}>Get results in 3 steps</h2>
            <p className="t-body" style={{ maxWidth: 420, marginInline: 'auto' }}>No complicated setup. No learning curve. Just upload and go.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 24 }}>
            {steps.map((s, i) => (
              <div key={i} className="card" style={{ padding: 32 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 800, color: 'var(--navy)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 14, background: 'var(--accent-light)', padding: '4px 10px', borderRadius: 6, display: 'inline-block' }}>{s.num}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10, color: 'var(--navy)' }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="section" style={{ background: 'var(--white)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="section-pill">Success stories</div>
            <h2 className="t-h1" style={{ marginBottom: 12 }}>People are getting hired</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card" style={{ padding: 28 }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--navy)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--navy)' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-3)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={{ padding: '80px 0', background: 'var(--navy)' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: 600 }}>
          <h2 style={{ fontSize: 'clamp(1.8rem,4vw,2.6rem)', fontWeight: 900, color: 'white', marginBottom: 14, letterSpacing: '-0.025em' }}>
            Your next interview starts here
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '1rem', marginBottom: 36, lineHeight: 1.7 }}>
            Join thousands of job seekers who've used Tech Vedhu ATS to land more interviews and better jobs.
          </p>
          <button className="btn btn-xl" style={{ background: 'white', color: 'var(--navy)', fontWeight: 800 }} onClick={() => navigate('/signup')}>
            Get Started Free — It's Instant →
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer style={{ background: 'var(--navy-dark)', padding: '28px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <TechVedhuLogo size={28} />
            <span style={{ color: 'white', fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.02em' }}>TECH VEDHU ATS</span>
          </div>
          <p style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.5)' }}>© {new Date().getFullYear()} Tech Vedhu. All rights reserved.</p>
          <a href="https://techvedhu.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'rgba(255,255,255,0.6)', textDecoration: 'underline' }}>techvedhu.com</a>
        </div>
      </footer>
    </div>
  );
}
