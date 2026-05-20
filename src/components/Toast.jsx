import { useEffect, useState } from 'react'

import { useResponsive } from '../config/responsive'

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
    const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => { setIsExiting(true); setTimeout(onClose, 300) }, duration)
    return () => clearTimeout(timer)
  }, [duration, onClose])

  const config = {
    success: { bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.25)', color: '#3fb950', icon: '✓' },
    error: { bg: 'rgba(248,81,73,0.12)', border: 'rgba(248,81,73,0.25)', color: '#f85149', icon: '✕' },
  }
  const c = config[type] || config.success

  return (
    <div style={{
      position: 'fixed', bottom: isMobile ? '100px' : '80px', right: isMobile ? '12px' : '20px',
      padding: '12px 16px', borderRadius: '10px',
      fontSize: '13px', fontWeight: '600',
      display: 'flex', alignItems: 'center', gap: '8px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
      zIndex: 2000, maxWidth: isMobile ? '85vw' : '280px',
      backgroundColor: '#161b22',
      border: `1px solid ${c.border}`,
      color: c.color,
      fontFamily: 'DM Sans, sans-serif',
      opacity: isExiting ? 0 : 1,
      transform: isExiting ? 'translateY(12px)' : 'translateY(0)',
      transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
      animation: 'slideUp 0.3s cubic-bezier(0.34,1.56,0.64,1)',
    }}>
      <span style={{ fontWeight: '800', fontSize: '14px' }}>{c.icon}</span>
      <span style={{ color: '#e6edf3' }}>{message}</span>
    </div>
  )
}