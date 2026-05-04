import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import Logo from './Logo'

export default function Footer() {
  const navigate = useNavigate()
  const { theme, currentTheme } = useTheme()

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
    <footer style={{
      backgroundColor: '#0d1117',
      borderTop: '1px solid rgba(255,255,255,0.06)',
      marginTop: '80px',
      padding: '48px 24px 32px',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      boxSizing: 'border-box',
    }}>
      <div style={{ maxWidth: '1140px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', textAlign: 'center' }}>
        <Logo theme={theme} currentTheme={currentTheme} />
        <p style={{ fontSize: '14px', color: '#7d8590', margin: 0, maxWidth: '360px', lineHeight: 1.6 }}>
          Connecting Canadian students to opportunities that matter.
        </p>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {links.map(link => (
            <button key={link.path} onClick={() => navigate(link.path)} style={{ fontSize: '13px', color: '#484f58', fontWeight: '500', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px', borderRadius: '8px', transition: 'color 0.15s ease', fontFamily: 'inherit' }}
              onMouseEnter={e => e.currentTarget.style.color = '#f59e0b'}
              onMouseLeave={e => e.currentTarget.style.color = '#484f58'}>
              {link.label}
            </button>
          ))}
        </div>
        <div style={{ width: '100%', maxWidth: '320px', height: '1px', backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <p style={{ fontSize: '11px', color: '#484f58', margin: 0 }}>
          © {new Date().getFullYear()} Verto · Built for Canadian high school students
        </p>
      </div>
    </footer>
  )
}