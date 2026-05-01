import { useEffect, useState } from 'react'

export default function Toast({ message, type = 'success', duration = 3000, onClose }) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onClose, 300)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  return (
    <div
      style={{
        ...styles.toast,
        ...styles[type],
        opacity: isExiting ? 0 : 1,
        transform: isExiting ? 'translateY(100px)' : 'translateY(0)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
    >
      {type === 'success' && <span style={styles.icon}>✓</span>}
      {type === 'error' && <span style={styles.icon}>✕</span>}
      {message}
    </div>
  )
}

const styles = {
  toast: {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    padding: '12px 16px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 2000,
    maxWidth: '300px',
  },
  success: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    border: '1px solid #bbf7d0',
  },
  error: {
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
  },
  icon: {
    fontWeight: '700',
    fontSize: '16px',
  },
}