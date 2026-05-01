import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function Landing() {
  const navigate = useNavigate()
  const [hoveredBtn, setHoveredBtn] = useState(null)

  const features = [
    { icon: '🎯', title: 'AI-matched', desc: 'Ranked by fit, not recency' },
    { icon: '🇨🇦', title: 'Canada-only', desc: 'No irrelevant US results' },
    { icon: '⚡', title: 'Zero noise', desc: 'Filtered to your grade & province' },
  ]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '40px 24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={styles.content}>

        <div style={styles.logoRow}>
          <svg width="40" height="40" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="18" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={styles.logoText}>verto</span>
        </div>

        <div style={styles.badge}>Built for Canadian high school students</div>

        <h1 style={styles.heading}>
          Find opportunities<br />
          that actually <span style={styles.highlight}>fit you.</span>
        </h1>

        <p style={styles.description}>
          Scholarships, competitions, internships, and programs — matched to your grade, province, and interests using AI. No endless scrolling.
        </p>

        <div style={styles.features}>
          {features.map(f => (
            <div key={f.title} style={styles.featureCard}>
              <span style={styles.featureIcon}>{f.icon}</span>
              <span style={styles.featureTitle}>{f.title}</span>
              <span style={styles.featureDesc}>{f.desc}</span>
            </div>
          ))}
        </div>

        <div style={styles.buttonGroup}>
          <button
            style={{
              ...styles.primaryBtn,
              transform: hoveredBtn === 'primary' ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoveredBtn === 'primary' ? '0 8px 20px rgba(6,78,59,0.3)' : '0 2px 8px rgba(6,78,59,0.15)',
            }}
            onClick={() => navigate('/signup')}
            onMouseEnter={() => setHoveredBtn('primary')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Get started — it's free
          </button>
          <button
            style={{
              ...styles.secondaryBtn,
              borderColor: hoveredBtn === 'secondary' ? '#064e3b' : '#d1d5db',
              color: hoveredBtn === 'secondary' ? '#064e3b' : '#555',
            }}
            onClick={() => navigate('/login')}
            onMouseEnter={() => setHoveredBtn('secondary')}
            onMouseLeave={() => setHoveredBtn(null)}
          >
            Sign in to your account
          </button>
        </div>

        <p style={styles.footnote}>Free for students · No account needed to browse</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '40px 24px',
  },
  content: {
    maxWidth: '540px',
    width: '100%',
    textAlign: 'center',
    animation: 'fadeSlideIn 0.4s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '32px',
  },
  logoText: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  badge: {
    display: 'inline-block',
    padding: '5px 14px',
    borderRadius: '20px',
    backgroundColor: '#f0fdf4',
    border: '1px solid #bbf7d0',
    fontSize: '12px',
    fontWeight: '600',
    color: '#16a34a',
    letterSpacing: '0.3px',
    marginBottom: '24px',
  },
  heading: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#111',
    lineHeight: '1.2',
    marginBottom: '16px',
    letterSpacing: '-1px',
  },
  highlight: {
    color: '#064e3b',
  },
  description: {
    fontSize: '16px',
    color: '#6b7280',
    lineHeight: '1.7',
    marginBottom: '36px',
    maxWidth: '440px',
    margin: '0 auto 36px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '36px',
  },
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    padding: '16px 12px',
    backgroundColor: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  featureIcon: {
    fontSize: '20px',
    marginBottom: '4px',
  },
  featureTitle: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#111',
  },
  featureDesc: {
    fontSize: '12px',
    color: '#9ca3af',
    lineHeight: '1.4',
  },
  buttonGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '20px',
  },
  primaryBtn: {
    padding: '14px 24px',
    borderRadius: '12px',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
  },
  secondaryBtn: {
    padding: '14px 24px',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#555',
    fontSize: '15px',
    fontWeight: '500',
    border: '1.5px solid #d1d5db',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  footnote: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '0',
  },
}