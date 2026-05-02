import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut, loading } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
    { path: '/courses', label: 'Courses', icon: '🎓' },
    { path: '/articles', label: 'Articles', icon: '📝' },
    { path: '/research', label: 'Research', icon: '📚' },
    { path: '/saves', label: 'Saved', icon: '★' },
    { path: '/analytics', label: 'Analytics', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ]

   const isActive = (path) => location.pathname === path

  const handleLogout = () => {
    signOut()
    navigate('/')
    setMobileMenuOpen(false)
  }

  const publicPaths = ['/', '/login', '/signup']
  if (publicPaths.includes(location.pathname)) return null
  if (!user) return null


  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <div style={styles.left}>
          <Logo />
        </div>

        <div style={styles.center}>
          {navItems.map(item => (
            <button
              key={item.path}
              style={{
                ...styles.navItem,
                ...(isActive(item.path) ? styles.navItemActive : {}),
              }}
              onClick={() => {
                navigate(item.path)
                setMobileMenuOpen(false)
              }}
            >
              <span style={styles.navIcon}>{item.icon}</span>
              <span style={styles.navLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        <div style={styles.right}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{profile?.full_name?.split(' ')[0] || 'User'}</span>
          </div>
          <button
            style={styles.signOutBtn}
            onClick={handleLogout}
            onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            Sign out
          </button>
        </div>

        <button
          style={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {mobileMenuOpen && (
        <div style={styles.mobileMenu}>
          {navItems.map(item => (
            <button
              key={item.path}
              style={{
                ...styles.mobileMenuItem,
                ...(isActive(item.path) ? styles.mobileMenuItemActive : {}),
              }}
              onClick={() => {
                navigate(item.path)
                setMobileMenuOpen(false)
              }}
            >
              <span>{item.icon}</span> {item.label}
            </button>
          ))}
          <button
            style={styles.mobileSignOut}
            onClick={handleLogout}
          >
            Sign out
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
    navbar: { backgroundColor: '#fff', borderBottom: '1px solid #e5e7eb', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, width: '100%', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' },
  container: { maxWidth: '1400px', margin: '0 auto', padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' },
  left: { minWidth: 'fit-content' },
 center: { display: 'flex', gap: '4px', flex: 1, justifyContent: 'center', flexWrap: 'wrap' },
  right: { display: 'flex', gap: '8px', alignItems: 'center', minWidth: 'fit-content' },
  navItem: { padding: '6px 8px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#6b7280', cursor: 'pointer', fontSize: '12px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  navItemActive: { backgroundColor: '#f0fdf4', color: '#064e3b' },
  navIcon: { fontSize: '14px' },
  navLabel: { display: 'inline' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '6px' },
  userName: { fontSize: '11px', fontWeight: '600', color: '#374151' },
  signOutBtn: { padding: '6px 10px', borderRadius: '8px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', fontSize: '11px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  mobileMenuBtn: { display: 'none', fontSize: '18px', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontFamily: 'inherit', padding: '4px 8px' },
  mobileMenu: { backgroundColor: '#f9fafb', borderTop: '1px solid #e5e7eb', padding: '12px 24px', display: 'flex', flexDirection: 'column', gap: '8px' },
  mobileMenuItem: { padding: '12px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#6b7280', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  mobileMenuItemActive: { backgroundColor: '#f0fdf4', color: '#064e3b' },
  mobileSignOut: { padding: '12px 14px', borderRadius: '8px', border: 'none', backgroundColor: '#fff', color: '#666', cursor: 'pointer', fontSize: '14px', fontWeight: '600', marginTop: '8px', fontFamily: 'inherit' },
}

// Media query styles for mobile
const mediaStyles = `
  @media (max-width: 768px) {
    nav [data-center] { display: none; }
    nav [data-mobile-btn] { display: block !important; }
    nav [data-label] { display: none; }
  }
  @media (min-width: 769px) {
    nav [data-mobile-btn] { display: none !important; }
    nav [data-label] { display: inline; }
  }
`

// Mobile styles
const mobileStyles = `
  @media (max-width: 640px) {
    nav [data-center] { display: none !important; }
    nav [data-mobile-btn] { display: flex !important; }
    nav [data-user-name] { display: none !important; }
  }
  @media (min-width: 641px) {
    nav [data-mobile-btn] { display: none !important; }
  }
`