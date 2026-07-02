import { useState } from 'react'

const OUTCOMES = [
  { value: 'won', label: '🏆 Won / Accepted', color: '#3fb950' },
  { value: 'finalist', label: '🥈 Finalist / Shortlisted', color: '#f59e0b' },
  { value: 'waitlisted', label: '⏳ Waitlisted', color: '#818cf8' },
  { value: 'rejected', label: '❌ Not selected', color: '#f85149' },
  { value: 'withdrawn', label: '↩️ Withdrew', color: '#8b949e' },
  { value: 'pending', label: '⏸️ Still waiting', color: '#58a6ff' },
]

export default function OutcomeModal({ opportunity, saveMetaId, userId, onClose, onSaved }) {
  const [outcome, setOutcome] = useState('')
  const [note, setNote] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [school, setSchool] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const isWin = outcome === 'won' || outcome === 'finalist'

  async function handleSave() {
    if (!outcome) { setError('Pick an outcome first.'); return }
    if (isPublic && !displayName.trim()) { setError('Enter a display name for the leaderboard.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/profile?action=outcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          saveMetaId,
          outcome,
          note: note || null,
          isPublic: isPublic && isWin,
          userId,
          opportunityId: opportunity.id,
          displayName: displayName.trim(),
          school: school.trim() || null,
          prizeAmount: opportunity.amount || null,
          opportunityTitle: opportunity.title,
          orgName: opportunity.org_name || null,
        }),
      })

      if (!res.ok) throw new Error('Something went wrong.')

      onSaved && onSaved(outcome)
      onClose()
    } catch (err) {
      setError(err.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '1rem'
    }}>
      <div style={{
        background: '#161b22', border: '1px solid #30363d',
        borderRadius: '12px', padding: '2rem', width: '100%',
        maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '1.25rem'
      }}>
        <div>
          <h2 style={{ color: '#e6edf3', margin: 0, fontSize: '1.1rem' }}>
            Log your outcome
          </h2>
          <p style={{ color: '#8b949e', margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
            {opportunity.title}
          </p>
        </div>

        {/* Outcome selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {OUTCOMES.map(o => (
            <button
              key={o.value}
              onClick={() => setOutcome(o.value)}
              style={{
                background: outcome === o.value ? `${o.color}18` : '#0d1117',
                border: `1px solid ${outcome === o.value ? o.color : '#30363d'}`,
                borderRadius: '8px', padding: '0.65rem 1rem',
                color: outcome === o.value ? o.color : '#8b949e',
                cursor: 'pointer', textAlign: 'left', fontSize: '0.9rem',
                transition: 'all 0.15s'
              }}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Note */}
        {outcome && (
          <textarea
            placeholder="Any notes? (optional)"
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            style={{
              background: '#0d1117', border: '1px solid #30363d',
              borderRadius: '8px', padding: '0.75rem', color: '#e6edf3',
              fontSize: '0.875rem', resize: 'vertical', outline: 'none',
              fontFamily: 'inherit'
            }}
          />
        )}

        {/* Leaderboard opt-in — only for wins */}
        {isWin && (
          <div style={{
            background: '#3fb95015', border: '1px solid #3fb95030',
            borderRadius: '8px', padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.75rem'
          }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={e => setIsPublic(e.target.checked)}
                style={{ accentColor: '#3fb950', width: '16px', height: '16px' }}
              />
              <span style={{ color: '#3fb950', fontSize: '0.875rem', fontWeight: 600 }}>
                🏆 Show on Verto Winners Leaderboard
              </span>
            </label>
            <p style={{ color: '#8b949e', fontSize: '0.8rem', margin: 0 }}>
              Inspire other students by sharing your win publicly.
            </p>

            {isPublic && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input
                  placeholder="Display name (e.g. Shahmeer K.)"
                  value={displayName}
                  onChange={e => setDisplayName(e.target.value)}
                  style={{
                    background: '#0d1117', border: '1px solid #30363d',
                    borderRadius: '8px', padding: '0.65rem 0.75rem',
                    color: '#e6edf3', fontSize: '0.875rem', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
                <input
                  placeholder="School (optional)"
                  value={school}
                  onChange={e => setSchool(e.target.value)}
                  style={{
                    background: '#0d1117', border: '1px solid #30363d',
                    borderRadius: '8px', padding: '0.65rem 0.75rem',
                    color: '#e6edf3', fontSize: '0.875rem', outline: 'none',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <p style={{ color: '#f85149', fontSize: '0.85rem', margin: 0 }}>{error}</p>
        )}

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #30363d',
              borderRadius: '8px', padding: '0.6rem 1.25rem',
              color: '#8b949e', cursor: 'pointer', fontSize: '0.875rem'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading || !outcome}
            style={{
              background: loading || !outcome ? '#21262d' : '#f59e0b',
              border: 'none', borderRadius: '8px',
              padding: '0.6rem 1.25rem',
              color: loading || !outcome ? '#8b949e' : '#000',
              cursor: loading || !outcome ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem', fontWeight: 600
            }}
          >
            {loading ? 'Saving...' : 'Save outcome'}
          </button>
        </div>
      </div>
    </div>
  )
}