import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SimilarOpportunities({ currentId, type }) {
  const [opps, setOpps] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!type) return
    async function fetch() {
      const { data } = await supabase
        .from('opportunities')
        .select('id, title, org_name, type, deadline, amount')
        .eq('is_active', true)
        .eq('type', type)
        .neq('id', currentId)
        .limit(3)
      setOpps(data || [])
    }
    fetch()
  }, [currentId, type])

  if (opps.length === 0) return null

  const typeColors = {
    scholarship: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', icon: '🎓' },
    competition: { color: '#818cf8', bg: 'rgba(99,102,241,0.08)', border: 'rgba(99,102,241,0.2)', icon: '🏆' },
    internship:  { color: '#3fb950', bg: 'rgba(63,185,80,0.08)',  border: 'rgba(63,185,80,0.2)',  icon: '💼' },
    program:     { color: '#c084fc', bg: 'rgba(192,132,252,0.08)',border: 'rgba(192,132,252,0.2)',icon: '📋' },
    grant:       { color: '#38bdf8', bg: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)', icon: '💰' },
  }

  return (
    <div style={{ marginTop: '48px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Similar opportunities</h3>
      <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 16px' }}>More {type}s you might like</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '12px' }}>
        {opps.map(op => {
          const tc = typeColors[op.type] || typeColors.program
          const daysLeft = op.deadline
            ? Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
            : null
          return (
            <div key={op.id} onClick={() => { navigate(`/opportunities/${op.id}`); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px', cursor: 'pointer', transition: 'all 0.2s ease' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = tc.border; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <span style={{ fontSize: '20px' }}>{tc.icon}</span>
                {daysLeft !== null && (
                  <span style={{ fontSize: '10px', fontWeight: '700', color: daysLeft <= 3 ? '#f85149' : '#484f58' }}>
                    {daysLeft <= 0 ? 'Closes today' : `${daysLeft}d left`}
                  </span>
                )}
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3', margin: '0 0 4px', lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>{op.title}</p>
              <p style={{ fontSize: '12px', color: '#7d8590', margin: '0 0 10px' }}>{op.org_name}</p>
              {op.amount && (
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#3fb950' }}>${op.amount.toLocaleString()}</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}