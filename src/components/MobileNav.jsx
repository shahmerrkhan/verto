import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState, useEffect } from 'react'

export default function MobileNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function checkMenu() { setMenuOpen(document.body.classList.contains('menu-open')) }
    const observer = new MutationObserver(checkMenu)
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    function handleResize() { setIsMobile(window.innerWidth < 768) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!user || !isMobile || menuOpen) return null

  const tabs = [
    { path: '/dashboard', icon: '⊞', label: 'Home' },
    { path: '/saves', icon: '◇', label: 'Saved' },
    { path: '/analytics', icon: '▲', label: 'Stats' },
    { path: '/profile', icon: '○', label: 'Profile' },
  ]

  return (
    <>
      <div style={{ height: '72px', display: 'block' }} className="mobile-nav-spacer" />
      <nav className="mobile-bottom-nav" style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, height: '64px',
        backgroundColor: 'rgba(13,17,23,0.97)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        zIndex: 999, paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
        {tabs.map(tab => {
          const active = location.pathname === tab.path
          return (
            <button key={tab.path} onClick={() => navigate(tab.path)} style={{
              flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '4px',
              border: 'none', backgroundColor: 'transparent', cursor: 'pointer',
              padding: '8px 4px', fontFamily: 'inherit', transition: 'all 0.15s ease',
            }}>
              <span style={{ fontSize: '18px', lineHeight: 1, color: active ? '#f59e0b' : '#484f58', transition: 'all 0.15s ease' }}>{tab.icon}</span>
              <span style={{ fontSize: '10px', fontWeight: '700', color: active ? '#f59e0b' : '#484f58', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{tab.label}</span>
              {active && <span style={{ position: 'absolute', bottom: '0', width: '24px', height: '2px', backgroundColor: '#f59e0b', borderRadius: '1px' }} />}
            </button>
          )
        })}
      </nav>
    </>
  )
}