import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Logo from './Logo'
import SearchPalette from './SearchPalette'
import { getAvatarColor, getInitials } from '../utils/avatarColor'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { theme, currentTheme, switchTheme, THEMES } = useTheme()

  const notifRef = useRef(null)
  const themeRef = useRef(null)
  const profileRef = useRef(null)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    if (mobileMenuOpen) document.body.classList.add('menu-open')
    else document.body.classList.remove('menu-open')
    return () => document.body.classList.remove('menu-open')
  }, [mobileMenuOpen])

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationsOpen(false)
      if (themeRef.current && !themeRef.current.contains(e.target)) setThemeMenuOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      setSearchOpen(prev => !prev)
    }
  }
  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [])

  useEffect(() => {
    if (user) {
      fetchNotifications()
      const interval = setInterval(fetchNotifications, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  async function fetchNotifications() {
    try {
      const today = new Date()
      const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
      const { data: upcomingDeadlines } = await supabase
        .from('opportunities').select('id, title, deadline, is_active')
        .eq('is_active', true).gte('deadline', today.toISOString())
        .lte('deadline', sevenDaysFromNow.toISOString())
        .order('deadline', { ascending: true }).limit(3)

      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      const { data: recentOpps } = await supabase
        .from('opportunities').select('id, title, created_at, is_active')
        .eq('is_active', true).gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false }).limit(2)

      const { data: highValue } = await supabase
        .from('opportunities').select('id, title, amount, is_active')
        .eq('is_active', true).gte('amount', 5000)
        .order('amount', { ascending: false }).limit(1)

      const notifs = []
      upcomingDeadlines?.forEach(opp => {
        const daysLeft = Math.ceil((new Date(opp.deadline) - today) / (1000 * 60 * 60 * 24))
        notifs.push({ id: `deadline-${opp.id}`, type: 'deadline', title: opp.title, message: `Deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`, relatedId: opp.id, time: getTimeAgo(new Date(opp.deadline)), icon: '⏰' })
      })
      recentOpps?.forEach(opp => {
        notifs.push({ id: `new-${opp.id}`, type: 'new', title: opp.title, message: 'Newly added opportunity', relatedId: opp.id, time: getTimeAgo(new Date(opp.created_at)), icon: '✨' })
      })
      highValue?.forEach(opp => {
        notifs.push({ id: `high-value-${opp.id}`, type: 'highValue', title: opp.title, message: `High value: $${opp.amount.toLocaleString()}`, relatedId: opp.id, time: 'Just now', icon: '💰' })
      })
      setNotifications(notifs)
    } catch (error) { console.error('Error fetching notifications:', error) }
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return `${Math.floor(hours / 24)}d ago`
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > 100) {
        setShowNavbar(currentScrollY <= lastScrollY)
      } else {
        setShowNavbar(true)
      }
      setLastScrollY(currentScrollY)
      setScrolled(currentScrollY > 10)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '⊞' },
    { path: '/courses', label: 'Courses', icon: '◈' },
    { path: '/articles', label: 'Articles', icon: '◎' },
    { path: '/research', label: 'Research', icon: '⬡' },
    { path: '/saves', label: 'Saved', icon: '◇' },
    { path: '/analytics', label: 'Analytics', icon: '▲' },
    { path: '/profile', label: 'Profile', icon: '○' },
  ]

  const isActive = (path) => location.pathname === path
  const handleLogout = () => { signOut(); navigate('/'); setMobileMenuOpen(false); setProfileDropdownOpen(false) }
  const handleNotificationClick = (notification) => { navigate(`/opportunities/${notification.relatedId}`); setNotificationsOpen(false) }

  const publicPaths = ['/', '/login', '/signup']
  if (publicPaths.includes(location.pathname)) return null
  if (!user) return null

  return (
    <>
      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 1024px) { .desktop-nav { display:none!important; } .mobile-hamburger { display:flex!important; } .desktop-right { display:none!important; } }
        @media (min-width: 1025px) { .mobile-hamburger { display:none!important; } }
        .nav-item:hover { background: rgba(245,158,11,0.08)!important; color: #f59e0b!important; }
        .icon-btn:hover { background: rgba(255,255,255,0.06)!important; }
        .dropdown-item:hover { background: rgba(255,255,255,0.05)!important; }
        .mobile-menu-item:hover { background: rgba(255,255,255,0.06)!important; }
      `}</style>

      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        backgroundColor: scrolled ? 'rgba(13,17,23,0.95)' : 'rgba(13,17,23,0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        transform: (showNavbar || mobileMenuOpen) ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1), background-color 0.3s ease, box-shadow 0.3s ease',
        boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
      }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 20px', height: '60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
          {/* Logo */}
          <div style={{ minWidth: 'fit-content', cursor: 'pointer' }} onClick={() => navigate('/dashboard')}>
            <Logo theme={theme} currentTheme={currentTheme} />
          </div>

          {/* Desktop nav */}
          <div className="desktop-nav" style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {navItems.map(item => (
              <button key={item.path} className="nav-item" onClick={() => navigate(item.path)} style={{
                padding: '7px 12px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                fontSize: '13px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px',
                transition: 'all 0.15s ease', fontFamily: 'inherit',
                color: isActive(item.path) ? '#f59e0b' : '#7d8590',
                backgroundColor: isActive(item.path) ? 'rgba(245,158,11,0.1)' : 'transparent',
                letterSpacing: '0.1px',
              }}>
                <span style={{ fontSize: '11px', opacity: 0.8 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop right */}
          <div className="desktop-right" style={{ display: 'flex', gap: '8px', alignItems: 'center', minWidth: 'fit-content' }}>
            <button className="icon-btn" onClick={() => setSearchOpen(true)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', height: '36px', cursor: 'pointer', color: '#484f58', fontSize: '13px', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#7d8590' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#484f58' }}>
              🔍 <span style={{ fontSize: '11px' }}>Search</span>
              <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '10px', color: '#484f58', fontFamily: 'inherit', marginLeft: '4px' }}>⌘K</kbd>
            </button>

            {/* Notifications */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button className="icon-btn" onClick={() => setNotificationsOpen(!notificationsOpen)} style={{
                position: 'relative', background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer', color: '#7d8590', fontSize: '16px',
                transition: 'all 0.15s ease',
              }}>
                🔔
                {notifications.length > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-4px', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '9px', fontWeight: '800', padding: '2px 5px', borderRadius: '6px', minWidth: '16px', textAlign: 'center', lineHeight: '12px' }}>
                    {notifications.length}
                  </span>
                )}
              </button>
              {notificationsOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '320px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', boxShadow: '0 20px 48px rgba(0,0,0,0.6)', zIndex: 2000, maxHeight: '360px', overflowY: 'auto', animation: 'slideDown 0.2s ease' }}>
                  <p style={{ padding: '12px 16px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: 0 }}>Notifications</p>
                  {notifications.length > 0 ? notifications.map(notif => (
                    <button key={notif.id} className="dropdown-item" onClick={() => handleNotificationClick(notif)} style={{ width: '100%', padding: '12px 14px', border: 'none', borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '10px', fontFamily: 'inherit', background: 'none', color: '#e6edf3', transition: 'background 0.15s', textAlign: 'left' }}>
                      <span style={{ fontSize: '15px', flexShrink: 0 }}>{notif.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: '0 0 3px 0', fontSize: '13px', fontWeight: '600', color: '#e6edf3' }}>{notif.title}</p>
                        <p style={{ margin: 0, fontSize: '11px', color: '#7d8590' }}>{notif.message} · {notif.time}</p>
                      </div>
                    </button>
                  )) : (
                    <p style={{ padding: '20px 16px', color: '#484f58', margin: 0, fontSize: '13px', textAlign: 'center' }}>No notifications</p>
                  )}
                </div>
              )}
            </div>

            {/* Theme */}
            <div style={{ position: 'relative' }} ref={themeRef}>
              <button className="icon-btn" onClick={() => setThemeMenuOpen(!themeMenuOpen)} style={{ background: 'none', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7d8590', fontSize: '16px', transition: 'all 0.15s ease' }}>🎨</button>
              {themeMenuOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: '200px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', boxShadow: '0 20px 48px rgba(0,0,0,0.6)', zIndex: 2000, overflow: 'hidden', animation: 'slideDown 0.2s ease' }}>
                  <p style={{ padding: '10px 14px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid rgba(255,255,255,0.06)', margin: 0 }}>Theme</p>
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button key={key} className="dropdown-item" onClick={() => { switchTheme(key); setThemeMenuOpen(false) }} style={{ width: '100%', padding: '10px 14px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: currentTheme === key ? '700' : '400', textAlign: 'left', transition: 'background 0.15s', fontFamily: 'inherit', color: currentTheme === key ? '#f59e0b' : '#e6edf3', background: currentTheme === key ? 'rgba(245,158,11,0.08)' : 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{t.emoji}</span>{t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile */}
            {(() => {
              const name = profile?.full_name || user?.email || ''
              const { bg, text } = getAvatarColor(name)
              const initials = getInitials(name)
              return (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', fontFamily: "'Syne', sans-serif", flexShrink: 0, letterSpacing: '0.3px' }}>
                  {initials}
                </div>
              )
            })()}
          </div>

          {/* Mobile hamburger */}
          <button className="mobile-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ display: 'none', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', width: '36px', height: '36px', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#e6edf3', fontSize: '16px', fontFamily: 'inherit' }}>
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div style={{ backgroundColor: '#0d1117', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '12px 16px 20px', position: 'fixed', top: '60px', left: 0, right: 0, maxHeight: 'calc(100vh - 60px)', overflowY: 'auto', zIndex: 9999, animation: 'slideDown 0.25s ease' }}>
            {navItems.map(item => (
              <button key={item.path} className="mobile-menu-item" onClick={() => { navigate(item.path); setMobileMenuOpen(false) }} style={{ width: '100%', padding: '13px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.15s ease', fontFamily: 'inherit', color: isActive(item.path) ? '#f59e0b' : '#e6edf3', backgroundColor: isActive(item.path) ? 'rgba(245,158,11,0.08)' : 'transparent', marginBottom: '2px' }}>
                <span style={{ fontSize: '13px' }}>{item.icon}</span> {item.label}
              </button>
            ))}

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '12px', paddingTop: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 14px 10px', margin: 0 }}>Notifications</p>
              {notifications.length > 0 ? notifications.slice(0, 3).map(notif => (
                <button key={notif.id} className="mobile-menu-item" onClick={() => { handleNotificationClick(notif); setMobileMenuOpen(false) }} style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)', backgroundColor: '#161b22', cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left', marginBottom: '6px', display: 'block' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{notif.icon} {notif.title}</span>
                  <span style={{ fontSize: '11px', color: '#7d8590' }}>{notif.message}</span>
                </button>
              )) : (
                <p style={{ fontSize: '13px', color: '#484f58', padding: '0 14px 8px' }}>No notifications</p>
              )}
            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingTop: '12px' }}>
              <p style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', padding: '0 14px 10px', margin: 0 }}>Theme</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 14px' }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} onClick={() => { switchTheme(key); setMobileMenuOpen(false) }} style={{ padding: '7px 12px', borderRadius: '8px', border: `1px solid ${currentTheme === key ? '#f59e0b' : 'rgba(255,255,255,0.08)'}`, backgroundColor: currentTheme === key ? 'rgba(245,158,11,0.1)' : '#161b22', color: currentTheme === key ? '#f59e0b' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleLogout} style={{ width: '100%', marginTop: '16px', padding: '13px 14px', borderRadius: '10px', border: '1px solid rgba(248,81,73,0.2)', background: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              Sign out
            </button>
          </div>
        )}
      </nav>
      {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
    </>
    
  )
}