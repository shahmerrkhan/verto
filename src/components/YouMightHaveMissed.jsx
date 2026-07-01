import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useResponsive } from '../config/responsive'

export default function YouMightHaveMissed() {
  const { isMobile } = useResponsive()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [opps, setOpps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function fetchMissed() {
      // Get user interests from profile
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

      const res = await window.fetch(`/api/opportunities?action=missed&userId=${user.id}`)
      const unseen = await res.json()
      setOpps(Array.isArray(unseen) ? unseen : [])
      setLoading(false)
    }
    fetchMissed()
  }, [user])

  if (loading || opps.length === 0) return null

  const typeColors = {
    scholarship: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '🎓' },
    competition: { color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: '🏆' },
    internship:  { color: '#3fb950', bg: 'rgba(63,185,80,0.08)',  border: 'rgba(63,185,80,0.2)',  icon: '💼' },
    program:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)',border: 'rgba(192,132,252,0.2)',icon: '📋' },
    grant:       { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)', icon: '💰' },
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif", letterSpacing: '-0.3px' }}>
            You might have missed
          </h2>
          <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>Added in the last 3 days</p>
        </div>
        <button onClick={() => navigate('/dashboard')} style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '600' }}>
          See all →
        </button>
      </div>

<div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: isMobile ? '10px' : '12px' }}>
          {opps.map(op => {
          const tc = typeColors[op.type] || typeColors.program
          const daysLeft = op.deadline
            ? Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null

          return (
            <div
              key={op.id}
              onClick={() => navigate(`/opportunities/${op.id}`)}
              style={{ backgroundColor: '#161b22', border: `1px solid rgba(255,255,255,0.07)`, borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '10px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tc.border; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '18px' }}>{tc.icon}</span>
                <span style={{ fontSize: '10px', fontWeight: '700', color: '#3fb950', backgroundColor: 'rgba(63,185,80,0.1)', padding: '2px 8px', borderRadius: '20px' }}>New</span>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3', margin: '0 0 4px', lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>{op.title}</p>
                <p style={{ fontSize: '12px', color: '#7d8590', margin: 0 }}>{op.org_name}</p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {op.amount && (
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#3fb950' }}>${op.amount.toLocaleString()}</span>
                )}
                {daysLeft !== null && (
                  <span style={{ fontSize: '11px', color: daysLeft <= 3 ? '#f85149' : '#484f58' }}>
                    {daysLeft <= 0 ? 'Closes today' : `${daysLeft}d left`}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}