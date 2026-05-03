import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../lib/supabase'
import Logo from './Logo'

export default function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuth()
  const { theme, currentTheme, switchTheme, THEMES } = useTheme()
  
  const notifRef = useRef(null)
  const themeRef = useRef(null)
  const profileRef = useRef(null)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false)
  const [themeMenuOpen, setThemeMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [scrolled, setScrolled] = useState(false)
  const [showNavbar, setShowNavbar] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotificationsOpen(false)
      }
      if (themeRef.current && !themeRef.current.contains(e.target)) {
        setThemeMenuOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Fetch real notifications
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
        .from('opportunities')
        .select('id, title, deadline, is_active')
        .eq('is_active', true)
        .gte('deadline', today.toISOString())
        .lte('deadline', sevenDaysFromNow.toISOString())
        .order('deadline', { ascending: true })
        .limit(3)

      const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000)
      const { data: recentOpps } = await supabase
        .from('opportunities')
        .select('id, title, created_at, is_active')
        .eq('is_active', true)
        .gte('created_at', threeDaysAgo.toISOString())
        .order('created_at', { ascending: false })
        .limit(2)

      const { data: highValue } = await supabase
        .from('opportunities')
        .select('id, title, amount, is_active')
        .eq('is_active', true)
        .gte('amount', 5000)
        .order('amount', { ascending: false })
        .limit(1)

      const notifs = []

      if (upcomingDeadlines?.length > 0) {
        upcomingDeadlines.forEach(opp => {
          const daysLeft = Math.ceil(
            (new Date(opp.deadline) - today) / (1000 * 60 * 60 * 24)
          )
          notifs.push({
            id: `deadline-${opp.id}`,
            type: 'deadline',
            title: opp.title,
            message: `Deadline in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}`,
            relatedId: opp.id,
            time: getTimeAgo(new Date(opp.deadline)),
            icon: '⏰',
          })
        })
      }

      if (recentOpps?.length > 0) {
        recentOpps.forEach(opp => {
          notifs.push({
            id: `new-${opp.id}`,
            type: 'new',
            title: opp.title,
            message: 'Newly added opportunity',
            relatedId: opp.id,
            time: getTimeAgo(new Date(opp.created_at)),
            icon: '✨',
          })
        })
      }

      if (highValue?.length > 0) {
        highValue.forEach(opp => {
          notifs.push({
            id: `high-value-${opp.id}`,
            type: 'highValue',
            title: opp.title,
            message: `High value: $${opp.amount.toLocaleString()}`,
            relatedId: opp.id,
            time: 'Just now',
            icon: '💰',
          })
        })
      }

      setNotifications(notifs)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > 100) {
        if (currentScrollY > lastScrollY) {
          setShowNavbar(false)
        } else {
          setShowNavbar(true)
        }
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
    setProfileDropdownOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Searching for:', searchQuery)
      setSearchQuery('')
      setSearchOpen(false)
    }
  }

  const handleNotificationClick = (notification) => {
    navigate(`/opportunities/${notification.relatedId}`)
    setNotificationsOpen(false)
  }

  const publicPaths = ['/', '/login', '/signup']
  if (publicPaths.includes(location.pathname)) return null
  if (!user) return null

  return (
    <nav style={{
      ...styles.navbar,
      backgroundColor: theme.surface,
      borderBottomColor: theme.border,
      transform: showNavbar ? 'translateY(0)' : 'translateY(-100%)',
      transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease, box-shadow 0.3s ease',
      boxShadow: scrolled ? `0 8px 32px rgba(0, 0, 0, 0.15)` : 'none',
    }}>
      <div style={styles.container}>

        {/* Logo */}
        <div style={styles.left}>
          <Logo theme={theme} currentTheme={currentTheme} />
        </div>

        {/* Desktop center nav — hidden on mobile */}
        <div style={{
          ...styles.center,
          display: 'flex',
        }}>
          <style>{`
            @media (max-width: 1024px) {
              .desktop-nav { display: none !important; }
              .mobile-hamburger { display: flex !important; }
              .desktop-right { display: none !important; }
            }
            @media (min-width: 1025px) {
              .mobile-hamburger { display: none !important; }
            }
          `}</style>
          <div className="desktop-nav" style={{ display: 'flex', gap: '4px' }}>
            {navItems.map(item => (
              <button
                key={item.path}
                style={{
                  ...styles.navItem,
                  color: isActive(item.path) ? theme.accent : theme.secondary,
                  backgroundColor: isActive(item.path) ? theme.hover : 'transparent',
                }}
                onClick={() => navigate(item.path)}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span style={styles.navLabel}>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Desktop right icons — hidden on mobile */}
        <div className="desktop-right" style={styles.right}>
          {/* Notifications */}
          <div style={styles.notificationContainer} ref={notifRef}>
            <button onClick={() => setNotificationsOpen(!notificationsOpen)} style={{ ...styles.iconBtn, color: theme.text }}>
              🔔
              {notifications.length > 0 && (
                <span style={{ ...styles.badge, backgroundColor: theme.accent }}>{notifications.length}</span>
              )}
            </button>
            {notificationsOpen && (
              <div style={{ ...styles.dropdown, backgroundColor: theme.surface, borderColor: theme.border }}>
                <p style={{ ...styles.dropdownHeader, color: theme.text, borderBottomColor: theme.border }}>Notifications</p>
                {notifications.length > 0 ? notifications.map(notif => (
                  <button key={notif.id} onClick={() => handleNotificationClick(notif)}
                    style={{ ...styles.notificationItem, backgroundColor: theme.bg, color: theme.text, borderColor: theme.border }}>
                    <span style={{ fontSize: '16px', marginRight: '8px' }}>{notif.icon}</span>
                    <div style={{ textAlign: 'left', flex: 1 }}>
                      <p style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: '600', color: theme.text }}>{notif.title}</p>
                      <p style={{ margin: '0', fontSize: '11px', color: theme.secondary }}>{notif.message} • {notif.time}</p>
                    </div>
                  </button>
                )) : (
                  <p style={{ padding: '14px 16px', color: theme.secondary, margin: 0, fontSize: '13px' }}>No notifications</p>
                )}
              </div>
            )}
          </div>

          {/* Theme */}
          <div style={styles.themeContainer} ref={themeRef}>
            <button onClick={() => setThemeMenuOpen(!themeMenuOpen)} style={{ ...styles.iconBtn, color: theme.text }}>🎨</button>
            {themeMenuOpen && (
              <div style={{ ...styles.dropdown, backgroundColor: theme.surface, borderColor: theme.border, width: '200px' }}>
                <p style={{ ...styles.dropdownHeader, color: theme.text, borderBottomColor: theme.border }}>Theme</p>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button key={key} onClick={() => { switchTheme(key); setThemeMenuOpen(false) }}
                    style={{ ...styles.themeOption, backgroundColor: currentTheme === key ? theme.hover : theme.bg, color: theme.text,
                      borderColor: currentTheme === key ? theme.accent : theme.border, borderWidth: currentTheme === key ? '2px' : '1px' }}>
                    <span style={{ marginRight: '8px' }}>{t.emoji}</span>{t.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Profile */}
          <div style={styles.profileContainer} ref={profileRef}>
            <button onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              style={{ ...styles.profileBtn, backgroundColor: theme.hover, color: theme.text, borderColor: theme.border }}>
              <span style={{ fontSize: '12px', fontWeight: '600' }}>{profile?.full_name?.split(' ')[0] || 'User'}</span>
              <span style={{ fontSize: '10px' }}>▼</span>
            </button>
            {profileDropdownOpen && (
              <div style={{ ...styles.dropdown, backgroundColor: theme.surface, borderColor: theme.border }}>
                <p style={{ ...styles.dropdownHeader, color: theme.text, borderBottomColor: theme.border }}>{profile?.full_name || 'Account'}</p>
                <button onClick={() => { navigate('/profile'); setProfileDropdownOpen(false) }}
                  style={{ ...styles.dropdownItem, color: theme.text, backgroundColor: theme.bg }}>👤 Profile</button>
                <button onClick={() => { navigate('/analytics'); setProfileDropdownOpen(false) }}
                  style={{ ...styles.dropdownItem, color: theme.text, backgroundColor: theme.bg }}>📊 Analytics</button>
                <button onClick={handleLogout}
                  style={{ ...styles.dropdownItem, color: '#ef4444', backgroundColor: theme.bg, borderTop: `1px solid ${theme.border}`, marginTop: '8px', paddingTop: '12px' }}>
                  🚪 Sign out
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile hamburger — only shows on mobile */}
        <button
          className="mobile-hamburger"
          style={{ ...styles.mobileMenuBtn, color: theme.text, display: 'none' }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div style={{
          ...styles.mobileMenu,
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          animation: 'slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}>
          {navItems.map(item => (
            <button key={item.path}
              style={{ ...styles.mobileMenuItem, color: isActive(item.path) ? theme.accent : theme.text,
                backgroundColor: isActive(item.path) ? theme.hover : theme.bg }}
              onClick={() => { navigate(item.path); setMobileMenuOpen(false) }}>
              <span>{item.icon}</span> {item.label}
            </button>
          ))}

          {/* Notifications in mobile menu */}
          <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: '8px', paddingTop: '8px', width: '100%', boxSizing: 'border-box' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: theme.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 14px 8px', margin: 0 }}>Notifications</p>
            {notifications.length > 0 ? notifications.slice(0, 3).map(notif => (
              <button key={notif.id} onClick={() => { handleNotificationClick(notif); setMobileMenuOpen(false) }}
                style={{ ...styles.mobileMenuItem, flexDirection: 'column', alignItems: 'flex-start', gap: '4px',
                  backgroundColor: theme.bg, width: '100%', boxSizing: 'border-box', borderRadius: '8px',
                  border: `1px solid ${theme.border}`, padding: '12px 14px' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: theme.text, display: 'block',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                  {notif.icon} {notif.title}
                </span>
                <span style={{ fontSize: '11px', color: theme.secondary, display: 'block' }}>{notif.message}</span>
              </button>
            )) : (
              <p style={{ fontSize: '13px', color: theme.secondary, padding: '4px 14px' }}>No notifications</p>
            )}
          </div>

          {/* Theme picker in mobile menu */}
          <div style={{ borderTop: `1px solid ${theme.border}`, marginTop: '8px', paddingTop: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: '700', color: theme.secondary, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 14px 8px' }}>Theme</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '0 14px' }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => { switchTheme(key); setMobileMenuOpen(false) }}
                  style={{ padding: '8px 12px', borderRadius: '8px', border: `2px solid ${currentTheme === key ? theme.accent : theme.border}`,
                    backgroundColor: currentTheme === key ? theme.hover : theme.bg, color: theme.text, fontSize: '12px', fontWeight: '600',
                    cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' }}>
                  {t.emoji} {t.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleLogout}
            style={{ ...styles.mobileSignOut, color: '#ef4444', backgroundColor: theme.bg, marginTop: '12px', borderTop: `1px solid ${theme.border}`, paddingTop: '16px' }}>
            🚪 Sign out
          </button>
        </div>
      )}
    </nav>
  )
}

const styles = {
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    width: '100%',
    borderBottom: '1px solid',
  },
  container: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '14px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  left: { minWidth: 'fit-content' },
  
searchBar: {
  display: window.innerWidth < 1024 ? 'none' : 'flex',
  alignItems: 'center',
  gap: '8px',
  flex: '0 1 300px',
},

  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'all 0.2s ease',
  },
  searchBtn: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '4px 8px',
  },
  mobileSearchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 16px',
    borderTop: '1px solid',
  },
  mobileSearchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: '10px',
    border: '1.5px solid',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
  },
  center: {
    display: 'flex',
    gap: '4px',
    flex: 1,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  right: {
    display: 'flex',
    gap: '14px',
    alignItems: 'center',
    minWidth: 'fit-content',
  },
  navItem: {
    padding: '8px 10px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    fontFamily: 'inherit',
  },
  navIcon: { fontSize: '14px' },
  navLabel: { display: 'inline' },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '6px 8px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    transition: 'transform 0.2s ease',
  },
  notificationContainer: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    color: '#fff',
    fontSize: '10px',
    fontWeight: '700',
    padding: '3px 5px',
    borderRadius: '6px',
    minWidth: '18px',
    textAlign: 'center',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: '10px',
    width: '320px',
    borderRadius: '12px',
    border: '1.5px solid',
    boxShadow: '0 20px 48px rgba(0, 0, 0, 0.2)',
    zIndex: 2000,
    maxHeight: '360px',
    overflowY: 'auto',
    animation: 'slideDown 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  dropdownHeader: {
    padding: '14px 16px',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    borderBottom: '1px solid',
    margin: '0',
  },
  dropdownItem: {
    width: '100%',
    padding: '13px 16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  notificationItem: {
    width: '100%',
    padding: '13px 14px',
    border: 'none',
    borderBottom: '1px solid',
    cursor: 'pointer',
    fontSize: '13px',
    display: 'flex',
    alignItems: 'flex-start',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: 'none',
  },
  themeContainer: {
    position: 'relative',
  },
  themeOption: {
    width: '100%',
    padding: '11px 14px',
    border: '1.5px solid',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    textAlign: 'left',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
    background: 'none',
    display: 'flex',
    alignItems: 'center',
  },
  profileContainer: {
    position: 'relative',
  },
  profileBtn: {
    padding: '8px 13px',
    borderRadius: '8px',
    border: '1.5px solid',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  mobileMenuBtn: {
    display: 'none',
    fontSize: '20px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    padding: '6px 8px',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileMenu: {
    borderTop: '1px solid',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'fixed',
    top: '56px',
    left: 0,
    right: 0,
    maxHeight: 'calc(100vh - 56px)',
    overflowY: 'auto',
    zIndex: 999,
  },
  mobileMenuItem: {
    padding: '13px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  mobileSignOut: {
    padding: '13px 14px',
    borderRadius: '8px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    marginTop: '8px',
    fontFamily: 'inherit',
  },
}
