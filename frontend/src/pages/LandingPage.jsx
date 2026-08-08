import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import logoImg from '../assets/image.png';

const Logo = ({ size = 36 }) => (
  <img src={logoImg} alt="Logo" style={{ width: size, height: size, objectFit: 'contain', borderRadius: 8, flexShrink: 0 }} />
);

const features = [
  { icon: '📊', title: 'ATS Score Analysis', desc: 'Get an accurate compatibility score showing exactly how recruiters\' ATS systems rank your resume.', color: '#6366f1' },
  { icon: '🎯', title: 'Keyword Matching', desc: 'Instantly identify every missing keyword from any job description. Know exactly what to add.', color: '#8b5cf6' },
  { icon: '🤖', title: 'AI-Powered Rewrites', desc: 'Receive specific, actionable rewrites powered by Groq AI to strengthen every resume section.', color: '#06b6d4' },
  { icon: '📁', title: 'Resume History', desc: 'Track score improvements across multiple uploads. See your resume evolution over time.', color: '#10b981' },
  { icon: '📂', title: 'Section Feedback', desc: 'Education, Experience, Skills, Projects — each section individually reviewed and rated.', color: '#f59e0b' },
  { icon: '💡', title: 'Role Recommendations', desc: 'Discover which job titles best match your current resume profile and skills.', color: '#f43f5e' },
];

const steps = [
  { num: '01', title: 'Upload Resume', desc: 'Drag and drop your PDF. It takes under 5 seconds to upload.', icon: '📤' },
  { num: '02', title: 'Add Job Description', desc: 'Paste any job posting for keyword-matched, role-specific analysis.', icon: '📋' },
  { num: '03', title: 'Get Your Report', desc: 'Receive score, missing keywords, and AI suggestions instantly.', icon: '⚡' },
];

const testimonials = [
  { name: 'Priya Sharma', role: 'Software Engineer · Infosys', text: 'My ATS score went from 48% to 82% in two revisions. I got 3 interview calls the same week!', avatar: 'P', score: '+34%' },
  { name: 'Arjun Mehta', role: 'Data Analyst · TCS', text: 'The keyword matching is incredible. It showed me exactly what was missing for each role.', avatar: 'A', score: '+28%' },
  { name: 'Sneha Reddy', role: 'Product Manager · Wipro', text: 'Section-by-section breakdown is something no other free tool offers. Genuinely impressed.', avatar: 'S', score: '+41%' },
];

function AnimatedCounter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const inc = target / 60;
        const timer = setInterval(() => {
          start += inc;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 20);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);
  return <span ref={ref}>{count}{suffix}</span>;
}

export default function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState(null);

  return (
    <div style={{ background: 'var(--bg)', color: 'var(--text-1)' }}>

      {/* ── Navbar ── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 999, height: 68, background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(20px)', borderBottom: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', display: 'flex', alignItems: 'center' }}>
        <div className="container navbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={48} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em', color: 'var(--text-1)' }}>TECH VEDHU</div>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--accent)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: -2 }}>ATS Checker</div>
            </div>
          </div>
          <nav className="hide-mobile" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
            {[['#features','Features'],['#how-it-works','How it works'],['#testimonials','Reviews']].map(([href, label]) => (
              <a key={href} href={href} style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-3)', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-1)'} onMouseLeave={e => e.target.style.color = 'var(--text-3)'}>{label}</a>
            ))}
          </nav>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/scan')}>Start ATS Scan</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', padding: '120px 0 100px', overflow: 'hidden' }}>
        {/* Orbs */}
        <div className="hero-orb" style={{ width: 600, height: 600, background: '#6366f1', top: -200, left: -100 }} />
        <div className="hero-orb" style={{ width: 400, height: 400, background: '#8b5cf6', bottom: -100, right: -50 }} />
        <div className="hero-orb" style={{ width: 300, height: 300, background: '#06b6d4', top: 100, right: '25%', opacity: 0.2 }} />

        <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: 800, marginInline: 'auto' }}>
          <div className="section-pill anim-fade-up">✦ Free for everyone — no credit card required</div>

          <h1 className="t-hero anim-fade-up-1" style={{ marginBottom: 24 }}>
            Is Your Resume <br />
            <span className="t-gradient">Passing the ATS?</span>
          </h1>

          <p className="anim-fade-up-2" style={{ fontSize: '1.15rem', color: 'var(--text-2)', maxWidth: 560, margin: '0 auto 44px', lineHeight: 1.75 }}>
            Upload your resume and get an instant ATS compatibility score, keyword gap analysis, and AI-powered improvement suggestions — in under 30 seconds.
          </p>

          <div className="anim-fade-up-3" style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 20 }}>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/scan')}>
              ⚡ Start ATS Scan
            </button>
          </div>

          <div className="anim-fade-up-4" style={{ display: 'flex', justifyContent: 'center', gap: 24, fontSize: '0.8rem', color: 'var(--text-3)' }}>
            {['✓ PDF format only', '✓ Firebase secured', '✓ Results in &lt;30s', '✓ No credit card'].map((t, i) => (
              <span key={i} dangerouslySetInnerHTML={{ __html: t }} />
            ))}
          </div>
        </div>

        {/* Hero Preview Card */}
        <div className="container anim-fade-up-4" style={{ marginTop: 72, maxWidth: 900, position: 'relative' }}>
          <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--glass-border)', boxShadow: '0 32px 80px rgba(0,0,0,0.6), 0 0 60px rgba(99,102,241,0.2)' }}>
            {/* Window bar */}
            <div style={{ background: 'var(--bg-2)', padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 8, borderBottom: '1px solid var(--border)' }}>
              {['#f43f5e','#f59e0b','#10b981'].map((c, i) => <div key={i} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, textAlign: 'center', fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-3)' }}>Tech Vedhu ATS — Dashboard Preview</div>
            </div>
            {/* Scores Grid */}
            <div className="grid-cols-3" style={{ padding: 32, background: 'var(--bg)' }}>
              {[
                { label: 'ATS Score', value: 84, color: '#10b981', icon: '🏆' },
                { label: 'Keyword Match', value: 71, color: '#6366f1', icon: '🎯' },
                { label: 'Readability', value: 91, color: '#06b6d4', icon: '📖' },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: 'center', padding: '24px 16px', background: 'var(--card)', borderRadius: 14, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
                  <div style={{ fontSize: '1.4rem', marginBottom: 8 }}>{s.icon}</div>
                  <div style={{ fontSize: '2.6rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}%</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-3)', fontWeight: 600, marginTop: 6 }}>{s.label}</div>
                  <div className="progress" style={{ marginTop: 12 }}>
                    <div className="progress-fill" style={{ width: `${s.value}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
            {/* Missing keywords preview */}
            <div style={{ padding: '16px 32px 24px', background: 'var(--bg-2)', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-4)', marginBottom: 10 }}>Missing Keywords Detected</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {['React.js', 'TypeScript', 'REST APIs', 'Docker', 'Agile', 'CI/CD'].map(kw => (
                  <span key={kw} className="skill-tag">{kw}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section style={{ padding: '60px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container grid-cols-4" style={{ gap: 0 }}>
          {[
            { value: 50, suffix: '+', label: 'Resumes Analyzed' },
            { value: 98, suffix: '%', label: 'ATS Accuracy Rate' },
            { value: 3, suffix: '×', label: 'More Interview Calls' },
            { value: 30, suffix: 's', label: 'Average Analysis Time' },
          ].map((s, i) => (
            <div key={i} className="stat-col">
              <div className="t-gradient" style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1 }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-3)', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="section" id="features">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-pill">Everything you need</div>
            <h2 className="t-h1" style={{ marginBottom: 14 }}>A complete resume <span className="t-gradient">analysis toolkit</span></h2>
            <p className="t-body" style={{ maxWidth: 480, marginInline: 'auto' }}>Every tool you need to turn a weak resume into one that passes ATS filters and impresses recruiters.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card card-lift"
                style={{ padding: '28px', cursor: 'default', background: activeFeature === i ? 'var(--card-hover)' : 'var(--card)' }}
                onMouseEnter={() => setActiveFeature(i)} onMouseLeave={() => setActiveFeature(null)}>
                <div className="feat-icon" style={{ background: `${f.color}18`, borderColor: `${f.color}30` }}>
                  <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                <div style={{ marginTop: 18, width: 32, height: 3, borderRadius: 2, background: f.color, transition: 'width 0.3s', ...(activeFeature === i ? { width: 64 } : {}) }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="section" id="how-it-works" style={{ background: 'var(--bg-2)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-pill">Simple process</div>
            <h2 className="t-h1" style={{ marginBottom: 14 }}>Get results in <span className="t-gradient">3 steps</span></h2>
            <p className="t-body" style={{ maxWidth: 420, marginInline: 'auto' }}>No complicated setup. No learning curve. Just upload and go.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 24, position: 'relative' }}>
            {steps.map((s, i) => (
              <div key={i} className="card" style={{ padding: 36, textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', fontSize: '1.8rem', boxShadow: 'var(--shadow-glow-sm)' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--accent)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10 }}>{s.num}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 10 }}>{s.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-3)', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section" id="testimonials">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <div className="section-pill">Success stories</div>
            <h2 className="t-h1" style={{ marginBottom: 14 }}>People are <span className="t-gradient">getting hired</span></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <div key={i} className="card card-lift" style={{ padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {[...Array(5)].map((_, j) => <span key={j} style={{ color: '#f59e0b', fontSize: '0.9rem' }}>★</span>)}
                  </div>
                  <span className="badge badge-success" style={{ fontSize: '0.82rem' }}>{t.score}</span>
                </div>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24, fontStyle: 'italic' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', boxShadow: 'var(--shadow-glow-sm)', flexShrink: 0 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-4)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '96px 0', position: 'relative', overflow: 'hidden' }}>
        <div className="hero-orb" style={{ width: 500, height: 500, background: '#6366f1', top: -150, left: '30%', opacity: 0.25 }} />
        <div className="container" style={{ position: 'relative', textAlign: 'center', maxWidth: 640 }}>
          <h2 className="t-h1" style={{ marginBottom: 18, fontSize: 'clamp(1.8rem,4vw,2.8rem)' }}>
            Your next interview <span className="t-gradient">starts here</span>
          </h2>
          <p style={{ color: 'var(--text-3)', fontSize: '1.05rem', marginBottom: 40, lineHeight: 1.75 }}>
            Join thousands of job seekers who've used Tech Vedhu ATS to land more interviews and better jobs.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-xl" onClick={() => navigate('/scan')}>
              Start ATS Scan — It's Free & Instant →
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: 'var(--bg-2)', borderTop: '1px solid var(--border)', padding: '32px 0' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Logo size={32} />
            <span style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em', color: 'var(--text-1)' }}>TECH VEDHU ATS</span>
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-4)' }}>© {new Date().getFullYear()} Tech Vedhu. All rights reserved.</p>
          <a href="https://techvedhu.com" target="_blank" rel="noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-hover)', textDecoration: 'underline' }}>techvedhu.com</a>
        </div>
      </footer>
    </div>
  );
}
