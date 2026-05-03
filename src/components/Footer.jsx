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
      backgroundColor: theme.surface,
      borderTop: `1px solid ${theme.border}`,
      marginTop: '80px',
      padding: '56px 24px 36px',
      width: '100vw',
      marginLeft: 'calc(-50vw + 50%)',
      boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '1140px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        textAlign: 'center',
      }}>
        <Logo theme={theme} currentTheme={currentTheme} />

        <p style={{
          fontSize: '14px',
          color: theme.secondary,
          margin: 0,
          maxWidth: '380px',
          lineHeight: 1.6,
        }}>
          Connecting Canadian students to opportunities that matter.
        </p>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {links.map(link => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              style={{
                fontSize: '13px',
                color: theme.secondary,
                fontWeight: '500',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '6px 12px',
                borderRadius: '8px',
                transition: 'color 0.15s ease',
                fontFamily: 'inherit',
              }}
              onMouseEnter={e => e.currentTarget.style.color = theme.accent}
              onMouseLeave={e => e.currentTarget.style.color = theme.secondary}
            >
              {link.label}
            </button>
          ))}
        </div>

        <div style={{
          width: '100%',
          maxWidth: '400px',
          height: '1px',
          backgroundColor: theme.border,
        }} />

        <p style={{ fontSize: '12px', color: theme.secondary, margin: 0, opacity: 0.6 }}>
          © {new Date().getFullYear()} Verto · Built for Canadian high school students
        </p>
      </div>
    </footer>
  )
}