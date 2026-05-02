import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user) return null
  if (!isMobile) return null

  const tabs = [
    { path: '/dashboard', icon: '🏠', label: 'Home' },
    { path: '/saves', icon: '★', label: 'Saved' },
    { path: '/analytics', icon: '📊', label: 'Stats' },
    { path: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <>
      {/* Spacer so content doesn't hide behind nav */}
      <div style={{ height: '72px', display: 'block' }} className="mobile-nav-spacer" />
        <nav style={S.nav} className="mobile-bottom-nav">
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button
              key={tab.path}
              style={{ ...S.tab, ...(active ? S.tabActive : {}) }}
              onClick={() => navigate(tab.path)}>
              <span style={{ ...S.icon, ...(active ? S.iconActive : {}) }}>{tab.icon}</span>
              <span style={{ ...S.label, ...(active ? S.labelActive : {}) }}>{tab.label}</span>
            </button>
          )
        })}
      </nav>
    </>
  )
}

const S = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '64px',
    backgroundColor: '#fff',
    borderTop: '1px solid #e5e7eb',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    zIndex: 999,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '3px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: '8px 4px',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  tabActive: {
    backgroundColor: '#f0fdf4',
  },
  icon: {
    fontSize: '20px',
    lineHeight: 1,
    filter: 'grayscale(1) opacity(0.5)',
    transition: 'all 0.15s ease',
  },
  iconActive: {
    filter: 'none',
  },
  label: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: '0.3px',
  },
  labelActive: {
    color: '#064e3b',
  },
}