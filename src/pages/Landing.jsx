import { useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useResponsive } from '../config/responsive'

export default function Landing() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)
  const [visibleSections, setVisibleSections] = useState(new Set())
  const { isMobile, isTablet, isDesktop } = useResponsive()

  useEffect(() => {
    const handleMouse = (e) => setMousePos({ x: e.clientX, y: e.clientY })
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('mousemove', handleMouse)
    window.addEventListener('scroll', handleScroll)
    return () => { window.removeEventListener('mousemove', handleMouse); window.removeEventListener('scroll', handleScroll) }
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) setVisibleSections(prev => new Set([...prev, entry.target.dataset.section]))
      })
    }, { threshold: 0.15 })
    document.querySelectorAll('[data-section]').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const cards = [
    { badge: 'Scholarship', badgeColor: '#3fb950', badgeBg: 'rgba(63,185,80,0.12)', title: 'Loran Scholarship', org: 'Loran Scholars Foundation', amount: '$100,000', deadline: '3 days left', urgency: '#f85149', match: 98 },
    { badge: 'Competition', badgeColor: '#818cf8', badgeBg: 'rgba(129,140,248,0.12)', title: 'Canadian Computing Competition', org: 'University of Waterloo', amount: 'National recognition', deadline: '12 days left', urgency: '#f59e0b', match: 95 },
    { badge: 'Internship', badgeColor: '#f59e0b', badgeBg: 'rgba(245,158,11,0.12)', title: 'RBC Summer Tech Labs', org: 'Royal Bank of Canada', amount: 'Paid position', deadline: '28 days left', urgency: '#3fb950', match: 91 },
  ]

  const features = [
    { icon: '⚡', title: 'AI-ranked by fit', body: 'Every opportunity scored against your grade, province, GPA, and interests. Best matches surface first, always.' },
    { icon: '🇨🇦', title: 'Canada-only', body: 'Zero American noise. Every listing scoped to Canadian students, filtered by province.' },
    { icon: '⏰', title: 'Deadline intelligence', body: 'Urgent deadlines surface automatically. Banner alerts when saved opportunities close within 7 days.' },
    { icon: '📊', title: 'Pipeline tracking', body: 'Track applications, add private notes, organize collections, and see your funnel in analytics.' },
    { icon: '🔍', title: 'Deep search', body: 'Full-text search across titles, orgs, descriptions, and tags. Ranked results, not just keyword matches.' },
    { icon: '🏆', title: 'Outcome logging', body: 'Log wins, finalists, rejections. Build a real record of your application history.' },
  ]

  const inView = (section) => visibleSections.has(section)

  const parallaxStyle = {
    transform: `translate(${(mousePos.x - window.innerWidth / 2) * 0.015}px, ${(mousePos.y - window.innerHeight / 2) * 0.015}px)`
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#080c10', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', color: '#e6edf3' }}>

      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes gridPulse { 0%, 100% { opacity: 0.03; } 50% { opacity: 0.07; } }
        @keyframes scanline { 0% { transform: translateY(-100%); } 100% { transform: translateY(100vh); } }
        @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes matchBar { from { width: 0; } to { width: var(--w); } }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .reveal { opacity: 0; transform: translateY(24px); transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1); }
        .reveal.visible { opacity: 1; transform: translateY(0); }
        .card-hover { transition: transform 0.3s cubic-bezier(0.16,1,0.3,1), border-color 0.3s ease, box-shadow 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); border-color: rgba(245,158,11,0.25) !important; box-shadow: 0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.1); }
        .btn-primary { transition: all 0.2s cubic-bezier(0.16,1,0.3,1); }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 16px 40px rgba(245,158,11,0.35); background-color: #fbbf24 !important; }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.25) !important; background-color: rgba(255,255,255,0.04) !important; }
        .nav-link:hover { color: #e6edf3 !important; }
        .feature-card { transition: background-color 0.2s ease, border-color 0.2s ease; }
        .feature-card:hover { background-color: #141a22 !important; border-color: rgba(245,158,11,0.15) !important; }
        .tag-pill { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; }
      `}</style>

      {/* Ambient background */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        {/* Grid */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '48px 48px', animation: 'gridPulse 6s ease-in-out infinite' }} />
        {/* Amber glow */}
        <div style={{ ...parallaxStyle, position: 'absolute', top: '-20%', right: '-10%', width: '70vw', height: '70vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.06) 0%, transparent 70%)', transition: 'transform 0.1s ease' }} />
        {/* Green glow */}
        <div style={{ ...parallaxStyle, position: 'absolute', bottom: '-10%', left: '-15%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(63,185,80,0.04) 0%, transparent 70%)', transition: 'transform 0.1s ease' }} />
        {/* Scanline */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, transparent, rgba(245,158,11,0.3), transparent)', animation: 'scanline 8s linear infinite', opacity: 0.5 }} />
      </div>

      {/* Hero */}
        <section ref={heroRef} style={{ position: 'relative', zIndex: 1, maxWidth: '1140px', margin: '0 auto', padding: 'clamp(80px, 15vw, 140px) 24px clamp(60px, 10vw, 100px)', display: 'grid', gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr', gap: isMobile || isTablet ? '40px' : '80px', alignItems: 'center' }}>

        {/* Left */}
        <div style={{ animation: 'fadeUp 0.8s cubic-bezier(0.16,1,0.3,1) both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 12px 5px 8px', borderRadius: '20px', backgroundColor: 'rgba(63,185,80,0.08)', border: '1px solid rgba(63,185,80,0.2)', fontSize: '11px', fontWeight: '700', color: '#3fb950', marginBottom: '32px', letterSpacing: '0.5px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3fb950', display: 'inline-block', boxShadow: '0 0 8px #3fb950' }} />
            BUILT FOR CANADIAN HIGH SCHOOL STUDENTS
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '800', color: '#e6edf3', lineHeight: 1.0, letterSpacing: '-2.5px', margin: '0 0 8px 0', fontFamily: "'Syne', sans-serif" }}>
            Every opportunity
          </h1>
          <h1 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '800', lineHeight: 1.0, letterSpacing: '-2.5px', margin: '0 0 28px 0', fontFamily: "'Syne', sans-serif', background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent" }}>
            <span style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #fcd34d 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>you actually qualify for.</span>
          </h1>

          <p style={{ fontSize: '16px', color: '#7d8590', lineHeight: 1.75, margin: '0 0 40px 0', maxWidth: '440px' }}>
            Scholarships, competitions, internships, programs — ranked by AI to match your grade, province, and interests. No noise. No irrelevant results.
          </p>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '10px', alignItems: isMobile ? 'stretch' : 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button className="btn-primary" onClick={() => navigate('/signup')} style={{ padding: '14px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1px', width: isMobile ? '100%' : 'auto' }}>
              Find my opportunities →
            </button>
              <button className="btn-ghost" onClick={() => navigate('/login')} style={{ padding: '14px 22px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'transparent', color: '#b1bac4', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', width: isMobile ? '100%' : 'auto' }}>
              Sign in
            </button>
          </div>

          <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>Free · No credit card · 2 minutes to set up</p>

          {/* Trust bar */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '20px', marginTop: '40px', paddingTop: '32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[['400+', 'opportunities'], ['AI', 'ranked by fit'], ['🇨🇦', 'Canada-only']].map(([val, label], i) => (
              <div key={i}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.5px' }}>{val}</div>
                <div style={{ fontSize: '11px', color: '#484f58', fontWeight: '500', marginTop: '2px' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        
        {/* Right — cards */}
          <div style={{ position: 'relative', animation: 'fadeUp 0.8s 0.15s cubic-bezier(0.16,1,0.3,1) both', display: isMobile || isTablet ? 'none' : 'block' }}>
          {/* Glow behind cards */}
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />

          {cards.map((card, i) => (
            <div key={i} className="card-hover" style={{ position: 'relative', backgroundColor: '#0e1318', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '20px 22px', marginTop: i > 0 ? '-12px' : '0', marginLeft: `${i * 24}px`, zIndex: 3 - i, opacity: 1 - i * 0.15, transform: `scale(${1 - i * 0.025})`, boxShadow: '0 16px 48px rgba(0,0,0,0.6)', cursor: 'default', animation: `float ${3 + i * 0.5}s ease-in-out infinite`, animationDelay: `${i * 0.3}s` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="tag-pill" style={{ backgroundColor: card.badgeBg, color: card.badgeColor }}>{card.badge}</span>
                <span style={{ fontSize: '11px', color: card.urgency, fontWeight: '600' }}>⏱ {card.deadline}</span>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 4px 0', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}>{card.title}</p>
              <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 14px 0' }}>{card.org}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: '#7d8590', fontWeight: '600' }}>{card.amount}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '4px', borderRadius: '2px', backgroundColor: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${card.match}%`, borderRadius: '2px', backgroundColor: '#f59e0b', transition: 'width 1s ease' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b' }}>{card.match}%</span>
                </div>
              </div>
            </div>
          ))}

          {/* Live indicator */}
          <div style={{ position: 'absolute', top: '-12px', right: '8px', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 10px', borderRadius: '20px', backgroundColor: '#0e1318', border: '1px solid rgba(63,185,80,0.2)', zIndex: 10 }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3fb950', display: 'inline-block', boxShadow: '0 0 8px #3fb950', animation: 'gridPulse 1.5s ease-in-out infinite' }} />
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#3fb950', letterSpacing: '0.5px' }}>LIVE</span>
          </div>
        </div>
      </section>

      {/* Marquee strip */}
      <div style={{ position: 'relative', zIndex: 1, borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', backgroundColor: '#0b0f14', padding: '16px 0', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '48px', animation: 'scanline 0s linear infinite', whiteSpace: 'nowrap' }}>
          {['Loran Scholarship', 'CCC', 'RBC Tech Labs', 'Shad Valley', 'TD Scholarships', 'YSpace', 'UBC Science Fair', 'Governor General Awards', 'Loran Scholarship', 'CCC', 'RBC Tech Labs', 'Shad Valley', 'TD Scholarships', 'YSpace'].map((name, i) => (
            <span key={i} style={{ fontSize: '12px', fontWeight: '600', color: '#484f58', letterSpacing: '0.5px', flexShrink: 0 }}>
              {name} <span style={{ color: 'rgba(245,158,11,0.3)', marginLeft: '12px' }}>—</span>
            </span>
          ))}
        </div>
      </div>

      {/* Features */}
      <section data-section="features" style={{ position: 'relative', zIndex: 1, padding: '120px 24px' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div className={`reveal ${inView('features') ? 'visible' : ''}`}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Why Verto</p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-1.5px', margin: '0 0 16px 0', fontFamily: "'Syne', sans-serif" }}>Built different,<br />on purpose.</h2>
            <p style={{ fontSize: '15px', color: '#7d8590', lineHeight: 1.7, margin: '0 0 64px 0', maxWidth: '480px' }}>Most platforms show you everything and let you figure it out. Verto does the work for you.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isMobile || isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)', gap: '1px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
            {features.map((f, i) => (
              <div key={i} className={`feature-card reveal ${inView('features') ? 'visible' : ''}`} data-section="features" style={{ padding: '32px', backgroundColor: '#0b0f14', transitionDelay: `${i * 0.07}s` }}>
                <div style={{ fontSize: '26px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', margin: '0 0 10px 0', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#7d8590', lineHeight: 1.7, margin: 0 }}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section data-section="how" style={{ position: 'relative', zIndex: 1, backgroundColor: '#0b0f14', padding: '120px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div className={`reveal ${inView('how') ? 'visible' : ''}`}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>How it works</p>
            <h2 style={{ fontSize: 'clamp(28px, 3vw, 44px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-1.5px', margin: '0 0 64px 0', fontFamily: "'Syne', sans-serif" }}>Up and running<br />in two minutes.</h2>
          </div>

          {[
            { num: '01', title: 'Create your profile', body: 'Tell us your grade, province, interests, and GPA. Two minutes, no fluff.' },
            { num: '02', title: 'Get matched instantly', body: 'Our AI ranks every opportunity in the database by how well it fits you specifically.' },
            { num: '03', title: 'Save, track, and win', body: 'Save what interests you, mark applications, log outcomes, and never lose track again.' },
          ].map((step, i) => (
            <div key={i} className={`reveal ${inView('how') ? 'visible' : ''}`} style={{ display: 'flex', gap: '40px', alignItems: 'flex-start', padding: '48px 0', borderBottom: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', transitionDelay: `${i * 0.1}s` }}>
              <div style={{ flexShrink: 0, width: '40px', height: '40px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.2)', backgroundColor: 'rgba(245,158,11,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', fontFamily: 'monospace', letterSpacing: '1px' }}>{step.num}</span>
              </div>
              <div>
                <h3 style={{ fontSize: '22px', fontWeight: '700', color: '#e6edf3', margin: '0 0 10px 0', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>{step.title}</h3>
                <p style={{ fontSize: '15px', color: '#7d8590', lineHeight: 1.7, margin: 0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section data-section="cta" style={{ position: 'relative', zIndex: 1, padding: '160px 24px', textAlign: 'center', overflow: 'hidden' }}>
        {/* CTA glow */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '600px', height: '400px', borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(245,158,11,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className={`reveal ${inView('cta') ? 'visible' : ''}`} style={{ maxWidth: '580px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '32px', letterSpacing: '0.5px' }}>
            400+ OPPORTUNITIES WAITING
          </div>
          <h2 style={{ fontSize: 'clamp(32px, 4vw, 52px)', fontWeight: '800', color: '#e6edf3', letterSpacing: '-2px', margin: '0 0 20px 0', lineHeight: 1.05, fontFamily: "'Syne', sans-serif" }}>
            Your next big opportunity<br />is already listed.
          </h2>
          <p style={{ fontSize: '16px', color: '#7d8590', lineHeight: 1.7, margin: '0 0 40px 0' }}>
            Join students across Canada who use Verto to find scholarships, competitions, and internships that actually fit them.
          </p>
          <button className="btn-primary" onClick={() => navigate('/signup')} style={{ padding: '18px 44px', borderRadius: '12px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '16px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '0.1px' }}>
            Get started free →
          </button>
          <p style={{ fontSize: '12px', color: '#484f58', marginTop: '16px' }}>No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: 'relative', zIndex: 1, backgroundColor: '#0b0f14', padding: '56px 24px 40px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '1140px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
                  <rect width="80" height="80" rx="16" fill="#064e3b"/>
                  <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
                </svg>
                <span style={{ fontSize: '18px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>verto</span>
              </div>
              <p style={{ fontSize: '13px', color: '#484f58', margin: 0, maxWidth: '260px', lineHeight: 1.6 }}>Connecting Canadian students to opportunities that matter.</p>
            </div>
              <div style={{ display: 'flex', gap: isMobile ? '24px' : '48px', flexWrap: 'wrap' }}>
                <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Platform</p>
                {['Dashboard', 'Saved', 'Analytics', 'Profile'].map(link => (
                  <a key={link} href={`/${link.toLowerCase()}`} style={{ display: 'block', fontSize: '13px', color: '#7d8590', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                    onMouseLeave={e => e.currentTarget.style.color = '#7d8590'}>{link}</a>
                ))}
              </div>
              <div>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px 0' }}>Community</p>
                {[['Articles', '/articles'], ['Research', '/research'], ['For Organizers', '/for-organizers'], ['Become a Mentor', '/mentors']].map(([label, href]) => (
                  <a key={label} href={href} style={{ display: 'block', fontSize: '13px', color: '#7d8590', textDecoration: 'none', fontWeight: '500', marginBottom: '8px', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#e6edf3'}
                    onMouseLeave={e => e.currentTarget.style.color = '#7d8590'}>{label}</a>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>© {new Date().getFullYear()} Verto · Built for Canadian high school students</p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="tag-pill" style={{ backgroundColor: 'rgba(63,185,80,0.08)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.15)' }}>🇨🇦 Canada</span>
              <span className="tag-pill" style={{ backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.15)' }}>Free forever</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}