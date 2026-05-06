import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'rgba(13,17,23,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
              <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
            </svg>
            <span style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>verto</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button onClick={() => navigate('/for-organizers')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'transparent', color: '#f59e0b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.08)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
              For Organizers
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#b1bac4', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
              Sign in
            </button>
            <button onClick={() => navigate('/signup')} style={{ padding: '8px 18px', borderRadius: '8px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)' }}>
              Get started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1140px', margin: '0 auto', padding: '130px 24px 80px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '60px', alignItems: 'center' }} className="verto-hero">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '20px', backgroundColor: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', fontSize: '12px', fontWeight: '700', color: '#3fb950', marginBottom: '28px', width: 'fit-content', letterSpacing: '0.3px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3fb950', display: 'inline-block' }} />
            Built for Canadian high school students
          </div>

          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', fontWeight: '800', color: '#e6edf3', lineHeight: 1.05, letterSpacing: '-2px', marginBottom: '20px', margin: '0 0 20px 0', fontFamily: "'Syne', sans-serif" }}>
            Every opportunity<br />
            <span style={{ color: '#f59e0b' }}>you actually qualify for.</span>
          </h1>

          <p style={{ fontSize: '16px', color: '#7d8590', lineHeight: 1.7, marginBottom: '36px', margin: '0 0 36px 0', maxWidth: '460px' }}>
            Scholarships, competitions, internships, and programs — ranked by AI to match your grade, province, and interests. No noise. No irrelevant results.
          </p>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/signup')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', letterSpacing: '0.1px' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(245,158,11,0.3)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
              Find my opportunities →
            </button>
            <button onClick={() => navigate('/login')} style={{ padding: '14px 24px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#b1bac4', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}>
              Sign in
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>Free · No credit card · Takes 2 minutes to set up</p>
        </div>

        {/* Preview cards */}
        <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', gap: '0' }}>
          {[
            { badge: 'Scholarship', badgeBg: 'rgba(63,185,80,0.1)', badgeColor: '#3fb950', title: 'Loran Scholarship', org: 'Loran Scholars Foundation', amount: '$100,000', deadline: '🔴 3 days left', match: '98%' },
            { badge: 'Competition', badgeBg: 'rgba(99,102,241,0.1)', badgeColor: '#818cf8', title: 'Canadian Computing Competition', org: 'University of Waterloo', amount: '🏆 National', deadline: '🟡 12 days left', match: '95%' },
            { badge: 'Internship', badgeBg: 'rgba(245,158,11,0.1)', badgeColor: '#f59e0b', title: 'RBC Summer Tech Labs', org: 'Royal Bank of Canada', amount: '💰 Paid', deadline: '🟢 28 days left', match: '91%' },
          ].map((card, i) => (
            <div key={i} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '8px', marginTop: i > 0 ? '-10px' : '0', marginLeft: `${i * 20}px`, opacity: 1 - i * 0.12, transform: `scale(${1 - i * 0.03})`, zIndex: 3 - i, boxShadow: '0 8px 32px rgba(0,0,0,0.5)', transition: 'all 0.3s ease' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ padding: '3px 9px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: card.badgeBg, color: card.badgeColor }}>{card.badge}</span>
                <span style={{ fontSize: '11px', color: '#484f58', fontWeight: '600' }}>{card.deadline}</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: 0, fontFamily: "'Syne', sans-serif" }}>{card.title}</p>
              <p style={{ fontSize: '12px', color: '#7d8590', margin: 0 }}>{card.org}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#7d8590' }}>{card.amount}</span>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '3px 8px', borderRadius: '6px' }}>{card.match} match</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#161b22', padding: '28px 24px', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
        {[
          { value: '400+', label: 'Opportunities listed' },
          { value: 'AI', label: 'Ranked by fit, not recency' },
          { value: '🇨🇦', label: 'Canada-only results' },
          { value: '2 min', label: 'To set up your profile' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 40px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>{s.value}</span>
            <span style={{ fontSize: '12px', color: '#484f58', fontWeight: '500' }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>Why Verto</p>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-1px', marginBottom: '12px', margin: '0 0 12px 0', fontFamily: "'Syne', sans-serif" }}>Built different, on purpose.</h2>
          <p style={{ fontSize: '15px', color: '#7d8590', lineHeight: 1.6, marginBottom: '56px', margin: '0 0 56px 0', maxWidth: '520px' }}>Most platforms show you everything and let you figure it out. Verto does the work for you.</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: '1px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
            {[
              { icon: '🎯', title: 'AI-matched to you', body: 'Every opportunity is scored based on your grade, province, GPA, interests, and financial need. Best fits float to the top.' },
              { icon: '🇨🇦', title: 'Canada-only, always', body: 'No American results cluttering your feed. Every listing is scoped to Canadian students — filtered by province.' },
              { icon: '⏰', title: 'Deadline-aware', body: 'Urgent deadlines surface automatically. Get a banner when something you saved is closing in 7 days.' },
              { icon: '📊', title: 'Track your pipeline', body: 'Mark applications, add private notes, organize into collections, and see your conversion funnel in analytics.' },
              { icon: '📚', title: 'Learn while you apply', body: 'Access curated courses, research papers, and community articles — written for high school students like you.' },
              { icon: '⚡', title: 'Zero noise', body: 'Filter by type, sort by deadline or value, search by keyword. Clean interface, no clutter. Just opportunities.' },
            ].map((f, i) => (
              <div key={i} style={{ padding: '28px', backgroundColor: '#161b22', transition: 'background-color 0.2s ease' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#1c2330'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#161b22'}>
                <div style={{ fontSize: '24px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', margin: '0 0 8px 0', fontFamily: "'Syne', sans-serif" }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#7d8590', lineHeight: 1.65, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ backgroundColor: '#161b22', padding: '100px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '16px' }}>How it works</p>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-1px', margin: '0 0 56px 0', fontFamily: "'Syne', sans-serif" }}>Up and running in minutes.</h2>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { num: '01', title: 'Create your profile', body: 'Tell us your grade, province, interests, and GPA. Takes two minutes.' },
              { num: '02', title: 'Get matched instantly', body: 'Our AI ranks every opportunity in the database by how well it fits you.' },
              { num: '03', title: 'Save and track', body: 'Save what interests you, mark your applications, and never lose track.' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '32px', alignItems: 'flex-start', padding: '36px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: '1px', minWidth: '28px', paddingTop: '4px' }}>{step.num}</span>
                <div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', margin: '0 0 8px 0', letterSpacing: '-0.3px', fontFamily: "'Syne', sans-serif" }}>{step.title}</h3>
                  <p style={{ fontSize: '14px', color: '#7d8590', lineHeight: 1.6, margin: 0 }}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '120px 24px', textAlign: 'center', backgroundColor: '#0d1117' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto' }}>
          <h2 style={{ fontSize: 'clamp(28px, 3vw, 40px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-1px', marginBottom: '16px', margin: '0 0 16px 0', lineHeight: 1.15, fontFamily: "'Syne', sans-serif" }}>Your next big opportunity is already listed.</h2>
          <p style={{ fontSize: '15px', color: '#7d8590', lineHeight: 1.6, marginBottom: '36px', margin: '0 0 36px 0' }}>Join students across Canada who use Verto to find scholarships, competitions, and internships that actually fit them.</p>
          <button onClick={() => navigate('/signup')} style={{ padding: '16px 40px', borderRadius: '12px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '15px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease', letterSpacing: '0.1px' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(245,158,11,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
            Get started free →
          </button>
          <p style={{ fontSize: '12px', color: '#484f58', marginTop: '16px' }}>No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: '#161b22', padding: '48px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            </svg>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>verto</span>
          </div>
          <p style={{ fontSize: '13px', color: '#484f58', margin: 0, maxWidth: '340px', lineHeight: 1.6 }}>Connecting Canadian students to opportunities that matter.</p>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {['Dashboard', 'Saved', 'Analytics', 'Profile', 'Articles', 'Research'].map(link => (
              <a key={link} href={`/${link.toLowerCase()}`} style={{ fontSize: '12px', color: '#484f58', textDecoration: 'none', fontWeight: '500', padding: '6px 10px', borderRadius: '6px', transition: 'color 0.15s ease' }}
                onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
                onMouseLeave={e => e.currentTarget.style.color = '#484f58'}>
                {link}
              </a>
            ))}
            <a href="/for-organizers" style={{ fontSize: '12px', color: '#f59e0b', textDecoration: 'none', fontWeight: '700', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.06)', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.12)' }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'rgba(245,158,11,0.06)' }}>
              For Organizers
            </a>
          </div>
          <p style={{ fontSize: '11px', color: '#484f58', margin: 0, opacity: 0.6 }}>© {new Date().getFullYear()} Verto · Built for Canadian high school students</p>
        </div>
      </footer>
    </div>
  )
}