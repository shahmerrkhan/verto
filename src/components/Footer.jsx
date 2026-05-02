import { useNavigate } from 'react-router-dom'

export default function Footer() {
  const navigate = useNavigate()

  const links = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Saved', path: '/saves' },
    { label: 'Analytics', path: '/analytics' },
    { label: 'Profile', path: '/profile' },
    { label: 'Courses', path: '/courses' },
    { label: 'Articles', path: '/articles' },
    { label: 'Research', path: '/research' },
  ]

  return (
    <footer style={S.footer}>
      <div style={S.inner}>
        <div style={S.brand}>
          <svg width="22" height="22" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={S.brandName}>verto</span>
        </div>

        <p style={S.tagline}>Connecting Canadian students to opportunities that matter.</p>

        <div style={S.links}>
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={S.link}
              onMouseEnter={e => e.currentTarget.style.color = '#064e3b'}
              onMouseLeave={e => e.currentTarget.style.color = '#6b7280'}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div style={S.divider} />

        <p style={S.copy}>© {new Date().getFullYear()} Verto · Built for Canadian high school students</p>
      </div>
    </footer>
  )
}

const S = {
  footer: {
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    marginTop: '80px',
    padding: '56px 24px 36px',
  },
  inner: {
    maxWidth: '1140px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  brandName: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  tagline: {
    fontSize: '14px',
    color: '#6b7280',
    margin: 0,
    maxWidth: '380px',
    lineHeight: 1.6,
  },
  links: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  link: {
    fontSize: '13px',
    color: '#6b7280',
    fontWeight: '500',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px 12px',
    borderRadius: '8px',
    transition: 'color 0.15s ease',
    fontFamily: 'inherit',
  },
  divider: {
    width: '100%',
    maxWidth: '400px',
    height: '1px',
    backgroundColor: '#f3f4f6',
  },
  copy: {
    fontSize: '12px',
    color: '#d1d5db',
    margin: 0,
  },
}