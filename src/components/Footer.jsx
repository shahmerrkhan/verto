export default function Footer() {
  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div style={S.brand}>
          <svg width="24" height="24" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={S.brandName}>verto</span>
        </div>
        <p style={S.tagline}>Connecting Canadian students to opportunities that matter.</p>
        <div style={S.links}>
          <a href="/dashboard" style={S.link}>Dashboard</a>
          <a href="/saves" style={S.link}>Saved</a>
          <a href="/analytics" style={S.link}>Analytics</a>
          <a href="/profile" style={S.link}>Profile</a>
        </div>
        <p style={S.copy}>© {new Date().getFullYear()} Verto. Built for Canadian high school students.</p>
      </div>
    </footer>
  )
}

const S = {
  footer: {
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#fafafa',
    marginTop: '80px',
    padding: '48px 24px 32px',
  },
  inner: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    textAlign: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandName: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    maxWidth: '360px',
  },
  links: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    fontSize: '13px',
    color: '#6b7280',
    textDecoration: 'none',
    fontWeight: '500',
  },
  copy: {
    fontSize: '12px',
    color: '#d1d5db',
    margin: 0,
  },
}