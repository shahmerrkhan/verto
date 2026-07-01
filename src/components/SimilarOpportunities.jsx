import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SimilarOpportunities({ currentId, type }) {
  const [opps, setOpps] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (!type) return
    async function load() {
      try {
        const res = await fetch(`/api/opportunities?action=similar&type=${type}&exclude=${currentId}`)
        const data = await res.json()
        setOpps(Array.isArray(data) ? data : [])
      } catch {
        setOpps([])
      }
    }
    load()
  }, [type, currentId])

  if (!opps.length) return null

  return (
    <div style={{ marginTop: '40px' }}>
      <h3 style={{
        fontSize: '14px',
        fontWeight: '600',
        color: 'var(--text-secondary)',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        marginBottom: '16px',
        fontFamily: 'var(--font-sans)',
      }}>
        Similar opportunities
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {opps.map(op => (
          <button
            key={op.id}
            onClick={() => navigate(`/opportunities/${op.id}`)}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface)',
              textAlign: 'left',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              transition: 'all var(--transition)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-strong)'
              e.currentTarget.style.backgroundColor = 'var(--bg-elevated)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-default)'
              e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px' }}>
              {op.title}
            </p>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: 0 }}>
              {op.org_name}
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}