import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')

  return (
    <div style={S.page}>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={S.navInner}>
          <div style={S.navLogo}>
            <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
              <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
            </svg>
            <span style={S.navLogoText}>verto</span>
          </div>
          <div style={S.navActions}>
            <button style={S.navLogin} onClick={() => navigate('/login')}>Sign in</button>
            <button style={S.navCta} onClick={() => navigate('/signup')}>Get started</button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={S.heroInner}>
          <div style={S.badge}>
            <span style={S.badgeDot} />
            Built for Canadian high school students
          </div>

          <h1 style={S.heading}>
            Every opportunity<br />
            <span style={S.headingAccent}>you actually qualify for.</span>
          </h1>

          <p style={S.subheading}>
            Scholarships, competitions, internships, and programs — ranked by AI to match your grade, province, and interests. No noise. No irrelevant results.
          </p>

          <div style={S.ctaRow}>
            <button
              style={S.ctaPrimary}
              onClick={() => navigate('/signup')}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,78,59,0.35)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(6,78,59,0.2)' }}
            >
              Find my opportunities →
            </button>
            <button
              style={S.ctaSecondary}
              onClick={() => navigate('/login')}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
            >
              Sign in
            </button>
          </div>

          <p style={S.footnote}>Free · No credit card · Takes 2 minutes to set up</p>
        </div>

        {/* Floating card preview */}
        <div style={S.previewWrap}>
          <div style={S.previewCard}>
            <div style={S.previewCardTop}>
              <span style={{ ...S.previewBadge, backgroundColor: '#dcfce7', color: '#166534' }}>scholarship</span>
              <span style={S.previewDeadline}>🔴 3 days left</span>
            </div>
            <p style={S.previewTitle}>Loran Scholarship</p>
            <p style={S.previewOrg}>Loran Scholars Foundation</p>
            <div style={S.previewFooter}>
              <span style={S.previewAmount}>💰 $100,000</span>
              <span style={S.previewMatch}>98% match</span>
            </div>
          </div>

          <div style={{ ...S.previewCard, marginTop: '-12px', marginLeft: '24px', opacity: 0.85, transform: 'scale(0.97)' }}>
            <div style={S.previewCardTop}>
              <span style={{ ...S.previewBadge, backgroundColor: '#dbeafe', color: '#1d4ed8' }}>competition</span>
              <span style={S.previewDeadline}>🟡 12 days left</span>
            </div>
            <p style={S.previewTitle}>Canadian Computing Competition</p>
            <p style={S.previewOrg}>University of Waterloo</p>
            <div style={S.previewFooter}>
              <span style={S.previewAmount}>🏆 National recognition</span>
              <span style={S.previewMatch}>95% match</span>
            </div>
          </div>

          <div style={{ ...S.previewCard, marginTop: '-12px', marginLeft: '48px', opacity: 0.6, transform: 'scale(0.94)' }}>
            <div style={S.previewCardTop}>
              <span style={{ ...S.previewBadge, backgroundColor: '#fef9c3', color: '#854d0e' }}>internship</span>
              <span style={S.previewDeadline}>🟢 28 days left</span>
            </div>
            <p style={S.previewTitle}>RBC Summer Tech Labs</p>
            <p style={S.previewOrg}>Royal Bank of Canada</p>
            <div style={S.previewFooter}>
              <span style={S.previewAmount}>💰 Paid</span>
              <span style={S.previewMatch}>91% match</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div style={S.statsBar}>
        {[
          { value: '400+', label: 'Opportunities listed' },
          { value: 'AI', label: 'Ranked by fit, not recency' },
          { value: '🇨🇦', label: 'Canada-only results' },
          { value: '2 min', label: 'To set up your profile' },
        ].map((s, i) => (
          <div key={i} style={S.statItem}>
            <span style={S.statValue}>{s.value}</span>
            <span style={S.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Features */}
      <section style={S.features}>
        <div style={S.featuresInner}>
          <div style={S.sectionLabel}>Why Verto</div>
          <h2 style={S.sectionTitle}>Built different, on purpose.</h2>
          <p style={S.sectionSub}>Most opportunity platforms show you everything and let you figure it out. Verto does the work for you.</p>

          <div style={S.featureGrid}>
            {[
              {
                icon: '🎯',
                title: 'AI-matched to you',
                body: 'Every opportunity is scored based on your grade, province, GPA, interests, and financial need. The best fits float to the top.',
                color: '#f0fdf4',
                border: '#bbf7d0',
              },
              {
                icon: '🇨🇦',
                title: 'Canada-only, always',
                body: 'No American results cluttering your feed. Every single listing is scoped to Canadian students — filtered by province.',
                color: '#eff6ff',
                border: '#bfdbfe',
              },
              {
                icon: '⏰',
                title: 'Deadline-aware',
                body: 'Urgent deadlines surface automatically. Get a banner when something you saved is closing in 7 days. Never miss an opportunity again.',
                color: '#fffbeb',
                border: '#fde68a',
              },
              {
                icon: '📊',
                title: 'Track your pipeline',
                body: 'Mark applications, add private notes, organize into collections, and see your conversion funnel in the analytics dashboard.',
                color: '#faf5ff',
                border: '#e9d5ff',
              },
              {
                icon: '📚',
                title: 'Learn while you apply',
                body: 'Access curated courses, research papers, and community articles — all written for high school students like you.',
                color: '#fff7ed',
                border: '#fed7aa',
              },
              {
                icon: '⚡',
                title: 'Zero noise',
                body: 'Filter by type, sort by deadline or value, search by keyword. Clean interface, no clutter. Just opportunities.',
                color: '#f0fdf4',
                border: '#bbf7d0',
              },
            ].map((f, i) => (
              <div
                key={i}
                style={{ ...S.featureCard, backgroundColor: f.color, borderColor: f.border }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <div style={S.featureIcon}>{f.icon}</div>
                <h3 style={S.featureTitle}>{f.title}</h3>
                <p style={S.featureBody}>{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={S.howSection}>
        <div style={S.howInner}>
          <div style={S.sectionLabel}>How it works</div>
          <h2 style={S.sectionTitle}>Up and running in minutes.</h2>

          <div style={S.steps}>
            {[
              { num: '01', title: 'Create your profile', body: 'Tell us your grade, province, interests, and GPA. Takes two minutes.' },
              { num: '02', title: 'Get matched instantly', body: 'Our AI ranks every opportunity in the database by how well it fits you.' },
              { num: '03', title: 'Save and track', body: 'Save what interests you, mark your applications, and never lose track.' },
            ].map((step, i) => (
              <div key={i} style={S.step}>
                <div style={S.stepNum}>{step.num}</div>
                <div>
                  <h3 style={S.stepTitle}>{step.title}</h3>
                  <p style={S.stepBody}>{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section style={S.ctaSection}>
        <div style={S.ctaSectionInner}>
          <h2 style={S.ctaSectionTitle}>Your next big opportunity is already listed.</h2>
          <p style={S.ctaSectionSub}>Join students across Canada who use Verto to find scholarships, competitions, and internships that actually fit them.</p>
          <button
            style={S.ctaSectionBtn}
            onClick={() => navigate('/signup')}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(6,78,59,0.35)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(6,78,59,0.2)' }}
          >
            Get started free →
          </button>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '16px' }}>No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer style={S.footer}>
        <div style={S.footerInner}>
          <div style={S.footerLogo}>
            <svg width="22" height="22" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
              <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
            </svg>
            <span style={S.footerLogoText}>verto</span>
          </div>
          <p style={S.footerTagline}>Connecting Canadian students to opportunities that matter.</p>
          <div style={S.footerLinks}>
            {['Dashboard', 'Saved', 'Analytics', 'Profile', 'Articles', 'Research'].map(link => (
              <a key={link} href={`/${link.toLowerCase()}`} style={S.footerLink}>{link}</a>
            ))}
          </div>
          <p style={S.footerCopy}>© {new Date().getFullYear()} Verto. Built for Canadian high school students.</p>
        </div>
      </footer>

    </div>
  )
}

const S = {
  page: {
    minHeight: '100vh',
    backgroundColor: '#fff',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    overflowX: 'hidden',
  },

  // Nav
  nav: {
    position: 'fixed',
    top: 0, left: 0, right: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255,255,255,0.85)',
    backdropFilter: 'blur(12px)',
    borderBottom: '1px solid rgba(0,0,0,0.06)',
  },
  navInner: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  navLogoText: { fontSize: '20px', fontWeight: '700', color: '#064e3b', letterSpacing: '-0.5px' },
  navActions: { display: 'flex', gap: '8px', alignItems: 'center' },
  navLogin: { padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', backgroundColor: 'transparent', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' },
  navCta: { padding: '8px 18px', borderRadius: '10px', border: 'none', backgroundColor: '#064e3b', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' },

  // Hero
  hero: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '140px 24px 80px',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
  },
  heroInner: { display: 'flex', flexDirection: 'column', gap: '0px' },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '6px 14px',
    borderRadius: '20px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#166534',
    marginBottom: '24px',
    width: 'fit-content',
    letterSpacing: '0.2px',
  },
  badgeDot: {
    width: '6px', height: '6px',
    borderRadius: '50%',
    backgroundColor: '#16a34a',
    display: 'inline-block',
  },
  heading: {
    fontSize: '52px',
    fontWeight: '700',
    color: '#0a0a0a',
    lineHeight: 1.1,
    letterSpacing: '-2px',
    marginBottom: '20px',
    margin: '0 0 20px 0',
  },
  headingAccent: { color: '#064e3b' },
  subheading: {
    fontSize: '17px',
    color: '#6b7280',
    lineHeight: 1.7,
    marginBottom: '36px',
    margin: '0 0 36px 0',
    maxWidth: '480px',
  },
  ctaRow: { display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap' },
  ctaPrimary: {
    padding: '14px 28px',
    borderRadius: '12px',
    border: 'none',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(6,78,59,0.2)',
    letterSpacing: '-0.2px',
  },
  ctaSecondary: {
    padding: '14px 24px',
    borderRadius: '12px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  footnote: { fontSize: '12px', color: '#9ca3af', margin: '0' },

  // Preview cards
  previewWrap: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },
  previewCard: {
    backgroundColor: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    transition: 'all 0.3s ease',
  },
  previewCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  previewBadge: { padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' },
  previewDeadline: { fontSize: '11px', fontWeight: '600', color: '#6b7280' },
  previewTitle: { fontSize: '15px', fontWeight: '700', color: '#111', margin: 0 },
  previewOrg: { fontSize: '13px', color: '#9ca3af', margin: 0 },
  previewFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #f3f4f6' },
  previewAmount: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  previewMatch: { fontSize: '12px', fontWeight: '700', color: '#064e3b', backgroundColor: '#f0fdf4', padding: '3px 8px', borderRadius: '6px' },

  // Stats bar
  statsBar: {
    borderTop: '1px solid #f3f4f6',
    borderBottom: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
    padding: '28px 24px',
    display: 'flex',
    justifyContent: 'center',
    gap: '0px',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '0 48px',
    borderRight: '1px solid #e5e7eb',
  },
  statValue: { fontSize: '24px', fontWeight: '700', color: '#111', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '13px', color: '#9ca3af', fontWeight: '500' },

  // Features
  features: { padding: '100px 24px' },
  featuresInner: { maxWidth: '1140px', margin: '0 auto' },
  sectionLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#064e3b',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-1px',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  sectionSub: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '56px',
    margin: '0 0 56px 0',
    maxWidth: '560px',
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))',
    gap: '20px',
  },
  featureCard: {
    padding: '28px',
    borderRadius: '16px',
    border: '1.5px solid transparent',
    transition: 'all 0.2s ease',
    cursor: 'default',
  },
  featureIcon: { fontSize: '28px', marginBottom: '16px' },
  featureTitle: { fontSize: '16px', fontWeight: '700', color: '#111', marginBottom: '8px', margin: '0 0 8px 0' },
  featureBody: { fontSize: '14px', color: '#6b7280', lineHeight: 1.65, margin: 0 },

  // How it works
  howSection: {
    backgroundColor: '#0a0a0a',
    padding: '100px 24px',
  },
  howInner: { maxWidth: '860px', margin: '0 auto' },
  steps: { display: 'flex', flexDirection: 'column', gap: '0px', marginTop: '56px' },
  step: {
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
    padding: '36px 0',
    borderBottom: '1px solid #1f1f1f',
  },
  stepNum: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#34d399',
    fontFamily: 'monospace',
    letterSpacing: '1px',
    minWidth: '32px',
    paddingTop: '3px',
  },
  stepTitle: { fontSize: '20px', fontWeight: '700', color: '#fff', marginBottom: '8px', margin: '0 0 8px 0', letterSpacing: '-0.3px' },
  stepBody: { fontSize: '15px', color: '#6b7280', lineHeight: 1.6, margin: 0 },

  // CTA section
  ctaSection: {
    padding: '120px 24px',
    textAlign: 'center',
    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #f0fdf4 100%)',
    borderTop: '1px solid #d1fae5',
    borderBottom: '1px solid #d1fae5',
  },
  ctaSectionInner: { maxWidth: '600px', margin: '0 auto' },
  ctaSectionTitle: {
    fontSize: '36px',
    fontWeight: '700',
    color: '#0a0a0a',
    letterSpacing: '-1px',
    marginBottom: '16px',
    margin: '0 0 16px 0',
    lineHeight: 1.2,
  },
  ctaSectionSub: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: 1.6,
    marginBottom: '36px',
    margin: '0 0 36px 0',
  },
  ctaSectionBtn: {
    padding: '16px 36px',
    borderRadius: '14px',
    border: 'none',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 16px rgba(6,78,59,0.2)',
    letterSpacing: '-0.2px',
  },

  // Footer
  footer: {
    backgroundColor: '#0a0a0a',
    padding: '60px 24px 40px',
  },
  footerInner: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },
  footerLogo: { display: 'flex', alignItems: 'center', gap: '10px' },
  footerLogoText: { fontSize: '18px', fontWeight: '700', color: '#fff', letterSpacing: '-0.5px' },
  footerTagline: { fontSize: '14px', color: '#6b7280', margin: 0, maxWidth: '360px' },
  footerLinks: { display: 'flex', gap: '24px', flexWrap: 'wrap', justifyContent: 'center' },
  footerLink: { fontSize: '13px', color: '#6b7280', textDecoration: 'none', fontWeight: '500', transition: 'color 0.15s ease' },
  footerCopy: { fontSize: '12px', color: '#374151', margin: 0 },
}