import { useState, useEffect, useRef } from 'react'
import MatchScore from './MatchScore'

export default function OpportunityModal({ opportunity, isSaved, onToggleSave, onLogView, onClose }) {
  const [similarOpps, setSimilarOpps] = useState([])
  const [copied, setCopied] = useState(false)
  const overlayRef = useRef(null)

  const {
    id, type, title, org_name, description, deadline, amount,
    location, requires_essay, url, created_at, _matchScore
  } = opportunity

  const typeConfig = {
    scholarship: { bg: 'rgba(63,185,80,0.12)', color: '#3fb950', label: 'Scholarship' },
    competition:  { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Competition' },
    internship:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Internship' },
    program:      { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', label: 'Program' },
    grant:        { bg: 'rgba(248,81,73,0.12)', color: '#f85149', label: 'Grant' },
  }
  const cfg = typeConfig[type] || { bg: 'rgba(125,133,144,0.12)', color: '#7d8590', label: type }

  const daysLeft = deadline
    ? Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  const deadlineColor = daysLeft === null ? '#484f58'
    : daysLeft < 0 ? '#484f58'
    : daysLeft <= 3 ? '#f85149'
    : daysLeft <= 7 ? '#f59e0b'
    : '#3fb950'

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function handleResize() {
      const modal = document.querySelector('.modal-scroll')
      if (modal && window.innerWidth < 640) {
        modal.style.maxWidth = '100%'
        modal.style.borderRadius = '16px 16px 0 0'
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    async function fetchSimilar() {
      const res = await fetch(`/api/similar?type=${type}&exclude=${id}`)
      const data = await res.json()
      setSimilarOpps(Array.isArray(data) ? data : [])
    }
    fetchSimilar()
  }, [id, type])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  async function handleCopy() {
    const shareUrl = `${window.location.origin}/opportunities/${id}`
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      style={{
        position: 'fixed', inset: 0, zIndex: 5000,
        backgroundColor: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.15s ease',
        fontFamily: 'DM Sans, sans-serif',
      }}
    >
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        .modal-scroll::-webkit-scrollbar { width: 4px; }
        .modal-scroll::-webkit-scrollbar-track { background: transparent; }
        .modal-scroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 99px; }
        .sim-card:hover { border-color: rgba(245,158,11,0.3) !important; background: rgba(245,158,11,0.04) !important; }
      `}</style>

      <div
        className="modal-scroll"
        style={{
          backgroundColor: '#161b22',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: window.innerWidth < 640 ? '16px 16px 0 0' : '18px',
          width: '100%',
          maxWidth: window.innerWidth < 640 ? '100%' : '620px',
          maxHeight: '90vh',
          overflowY: 'auto',
          boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
          animation: 'slideUp 0.2s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 24px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0,
          backgroundColor: '#161b22',
          zIndex: 1,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{
                padding: '4px 10px', borderRadius: '6px', fontSize: '10px',
                fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px',
                backgroundColor: cfg.bg, color: cfg.color,
              }}>
                {cfg.label}
              </span>
              {_matchScore !== null && _matchScore !== undefined && (
                <MatchScore score={_matchScore} compact />
              )}
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: '#7d8590', fontSize: '16px',
                flexShrink: 0, transition: 'all 0.15s',
              }}
            >✕</button>
          </div>

          <h2 style={{
            fontSize: '20px', fontWeight: '800', color: '#e6edf3',
            margin: '14px 0 4px', lineHeight: 1.3,
            fontFamily: "'Syne', sans-serif",
          }}>{title}</h2>
          <p style={{ fontSize: '13px', color: '#7d8590', margin: 0, fontWeight: '500' }}>{org_name}</p>
        </div>

        {/* Match score bar (full version) */}
        {_matchScore !== null && _matchScore !== undefined && (
          <div style={{ padding: '16px 24px 0' }}>
            <MatchScore score={_matchScore} compact={false} />
          </div>
        )}

        {/* Body */}
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* Meta pills */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {deadline && (
              <span style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                backgroundColor: `${deadlineColor}18`, color: deadlineColor,
                border: `1px solid ${deadlineColor}30`,
              }}>
                📅 {daysLeft !== null && daysLeft >= 0
                  ? `${new Date(deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })} · ${daysLeft === 0 ? 'Due today' : `${daysLeft}d left`}`
                  : daysLeft < 0 ? 'Closed' : new Date(deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {amount > 0 && (
              <span style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '700',
                backgroundColor: 'rgba(63,185,80,0.1)', color: '#3fb950',
                border: '1px solid rgba(63,185,80,0.2)',
              }}>
                💰 {amount === 1 ? 'Varies' : `$${amount.toLocaleString()}`}
              </span>
            )}
            {location && (
              <span style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                backgroundColor: 'rgba(255,255,255,0.04)', color: '#7d8590',
                border: '1px solid rgba(255,255,255,0.07)',
              }}>
                📍 {location}
              </span>
            )}
            {requires_essay === false && (
              <span style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                backgroundColor: 'rgba(129,140,248,0.1)', color: '#818cf8',
                border: '1px solid rgba(129,140,248,0.2)',
              }}>
                ⭐ No essay
              </span>
            )}
            {created_at && Math.ceil((new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24)) <= 7 && (
              <span style={{
                padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '600',
                backgroundColor: 'rgba(245,158,11,0.08)', color: '#f59e0b',
                border: '1px solid rgba(245,158,11,0.15)',
              }}>
                🆕 Just added
              </span>
            )}
          </div>

          {/* Description */}
          <div>
            <p style={{
              fontSize: '10px', fontWeight: '700', color: '#484f58',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 10px',
            }}>About</p>
            <p style={{
              fontSize: '14px', color: '#c9d1d9', lineHeight: 1.7, margin: 0,
            }}>{description}</p>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  flex: 1, minWidth: '120px',
                  padding: '11px 20px', borderRadius: '10px',
                  backgroundColor: '#f59e0b', color: '#0d1117',
                  fontSize: '13px', fontWeight: '700',
                  textDecoration: 'none', textAlign: 'center',
                  display: 'inline-block', transition: 'opacity 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                Apply now →
              </a>
            )}
            <button
              onClick={() => onToggleSave(id)}
              style={{
                padding: '11px 18px', borderRadius: '10px',
                border: isSaved ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.08)',
                backgroundColor: isSaved ? 'rgba(245,158,11,0.1)' : 'transparent',
                color: isSaved ? '#f59e0b' : '#7d8590',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button
              onClick={handleCopy}
              style={{
                padding: '11px 18px', borderRadius: '10px',
                border: '1px solid rgba(255,255,255,0.08)',
                backgroundColor: copied ? 'rgba(63,185,80,0.1)' : 'transparent',
                color: copied ? '#3fb950' : '#7d8590',
                fontSize: '13px', fontWeight: '600', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}
            >
              {copied ? '✓ Copied' : '⎘ Share'}
            </button>
          </div>
        </div>

        {/* Similar opportunities */}
        {similarOpps.length > 0 && (
          <div style={{
            padding: '20px 24px 24px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <p style={{
              fontSize: '10px', fontWeight: '700', color: '#484f58',
              textTransform: 'uppercase', letterSpacing: '0.8px', margin: '0 0 12px',
            }}>Similar opportunities</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {similarOpps.map(op => {
                const simDays = op.deadline
                  ? Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                  : null
                const simColor = simDays === null ? '#484f58' : simDays <= 3 ? '#f85149' : simDays <= 7 ? '#f59e0b' : '#484f58'
                return (
                  <div
                    key={op.id}
                    className="sim-card"
                    onClick={() => {
                      onLogView(op.id)
                      onClose()
                    }}
                    style={{
                      padding: '12px 14px', borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.06)',
                      backgroundColor: 'rgba(255,255,255,0.02)',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{
                        margin: '0 0 3px', fontSize: '13px', fontWeight: '600',
                        color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>{op.title}</p>
                      <p style={{ margin: 0, fontSize: '11px', color: '#7d8590' }}>{op.org_name}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      {op.amount > 0 && (
                        <span style={{ fontSize: '11px', fontWeight: '700', color: '#3fb950' }}>
                          ${op.amount.toLocaleString()}
                        </span>
                      )}
                      {op.deadline && (
                        <span style={{ fontSize: '11px', fontWeight: '600', color: simColor }}>
                          {simDays !== null && simDays >= 0 ? `${simDays}d` : 'Closed'}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}