import { useState, useEffect } from 'react'

export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function handleScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '20px',
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.1)',
        backgroundColor: '#161b22',
        color: '#7d8590',
        fontSize: '16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 800,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        transition: 'all 0.2s ease',
        animation: 'slideUp 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; e.currentTarget.style.color = '#f59e0b'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#7d8590'; e.currentTarget.style.transform = 'translateY(0)' }}
      title="Back to top"
    >
      ↑
    </button>
  )
}