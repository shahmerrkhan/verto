import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function OpportunityOfTheDay() {
  const [opp, setOpp] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchOpp() {
      const { data } = await supabase
        .from('opportunities')
        .select('id, title, org_name, type, deadline, amount, description')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)

      if (!data || data.length === 0) { setLoading(false); return }

      const dayIndex = Math.floor(Date.now() / 86400000) % data.length
      setOpp(data[dayIndex])
      setLoading(false)
    }
    fetchOpp()
  }, [])

  if (loading || !opp) return null

  const typeColors = {
    scholarship: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.25)', icon: '🎓' },
    competition: { color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.25)', icon: '🏆' },
    internship:  { color: '#3fb950', bg: 'rgba(63,185,80,0.08)',  border: 'rgba(63,185,80,0.25)',  icon: '💼' },
    program:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)',border: 'rgba(192,132,252,0.25)',icon: '📋' },
    grant:       { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.25)', icon: '💰' },
  }
  const tc = typeColors[opp.type] || typeColors.program

  const daysLeft = opp.deadline
    ? Math.ceil((new Date(opp.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div
      onClick={() => navigate(`/opportunities/${opp.id}`)}
      style={{
        background: `linear-gradient(135deg, ${tc.bg} 0%, rgba(13,17,23,0) 60%), #161b22`,
        border: `1px solid ${tc.border}`,
        borderRadius: '16px',
        padding: '24px 28px',
        marginBottom: '28px',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px rgba(0,0,0,0.4)` }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}
    >
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', borderRadius: '50%', background: `radial-gradient(circle, ${tc.bg} 0%, transparent 70%)`, pointerEvents: 'none' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '10px', fontWeight: '800', color: tc.color, textTransform: 'uppercase', letterSpacing: '1.5px', backgroundColor: tc.bg, border: `1px solid ${tc.border}`, padding: '3px 10px', borderRadius: '20px' }}>
              ✦ Opportunity of the day
            </span>
            <span style={{ fontSize: '12px', color: '#484f58' }}>{tc.icon} {opp.type}</span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 6px', lineHeight: 1.3, letterSpacing: '-0.4px', fontFamily: "'Syne', sans-serif" }}>
            {opp.title}
          </h2>
          <p style={{ fontSize: '13px', color: '#7d8590', margin: '0 0 14px', fontWeight: '500' }}>{opp.org_name}</p>

          {opp.description && (
            <p style={{ fontSize: '13px', color: '#7d8590', margin: '0 0 18px', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', maxWidth: '560px' }}>
              {opp.description}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            {opp.amount && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#3fb950', backgroundColor: 'rgba(63,185,80,0.1)', border: '1px solid rgba(63,185,80,0.2)', padding: '4px 10px', borderRadius: '20px' }}>
                ${opp.amount.toLocaleString()}
              </span>
            )}
            {daysLeft !== null && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: daysLeft <= 3 ? '#f85149' : '#7d8590', backgroundColor: daysLeft <= 3 ? 'rgba(248,81,73,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${daysLeft <= 3 ? 'rgba(248,81,73,0.2)' : 'rgba(255,255,255,0.07)'}`, padding: '4px 10px', borderRadius: '20px' }}>
                {daysLeft <= 0 ? 'Closes today' : daysLeft === 1 ? '1 day left' : `${daysLeft} days left`}
              </span>
            )}
            <span style={{ fontSize: '12px', color: tc.color, fontWeight: '600' }}>View opportunity →</span>
          </div>
        </div>

        {/* Big icon */}
        <div style={{ width: '64px', height: '64px', borderRadius: '16px', backgroundColor: tc.bg, border: `1px solid ${tc.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>
          {tc.icon}
        </div>
      </div>
    </div>
  )
}