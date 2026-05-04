import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function UrgentNudge() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [nudge, setNudge] = useState(null)
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!user || dismissed) return
    const alreadyShown = sessionStorage.getItem('urgentNudgeShown')
    if (alreadyShown) return

    async function checkUrgent() {
      const { data: saves } = await supabase
        .from('saves')
        .select('opportunity_id')
        .eq('user_id', user.id)

      if (!saves || saves.length === 0) return

      const ids = saves.map(s => s.opportunity_id)
      const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      const now = new Date().toISOString()

      const { data: urgent } = await supabase
        .from('opportunities')
        .select('id, title, deadline')
        .in('id', ids)
        .eq('is_active', true)
        .gte('deadline', now)
        .lte('deadline', cutoff)
        .order('deadline', { ascending: true })
        .limit(1)

      if (urgent && urgent.length > 0) {
        const op = urgent[0]
        const hours = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60))
        setNudge({ ...op, hours })
        setTimeout(() => setVisible(true), 2000)
        sessionStorage.setItem('urgentNudgeShown', 'true')
      }
    }

    checkUrgent()
  }, [user, dismissed])

  function handleDismiss() {
    setVisible(false)
    setTimeout(() => setDismissed(true), 300)
  }

  function handleClick() {
    navigate(`/opportunities/${nudge.id}`)
    handleDismiss()
  }

  if (!nudge || dismissed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '90px',
      left: '20px',
      maxWidth: '320px',
      backgroundColor: '#161b22',
      border: '1px solid rgba(248,81,73,0.3)',
      borderRadius: '12px',
      padding: '14px 16px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      zIndex: 850,
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0)' : 'translateY(16px)',
      transition: 'all 0.4s cubic-bezier(0.34,1.56,0.64,1)',
      fontFamily: 'DM Sans, sans-serif',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
            <span style={{ fontSize: '13px' }}>🔥</span>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f85149', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Closing in {nudge.hours}h</span>
          </div>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', margin: '0 0 10px', lineHeight: 1.35 }}>{nudge.title}</p>
          <button
            onClick={handleClick}
            style={{ padding: '7px 14px', borderRadius: '7px', border: 'none', backgroundColor: '#f85149', color: '#fff', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#ff6b6b'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f85149'}
          >
            View now →
          </button>
        </div>
        <button
          onClick={handleDismiss}
          style={{ background: 'none', border: 'none', color: '#484f58', fontSize: '14px', cursor: 'pointer', padding: 0, flexShrink: 0 }}
        >✕</button>
      </div>
    </div>
  )
}