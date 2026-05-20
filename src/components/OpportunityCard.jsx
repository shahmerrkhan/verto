import { useState } from 'react'
import { useResponsive, COMPONENT, COLORS, SPACING } from '../config/responsive'
import OpportunityModal from './OpportunityModal'
import MatchScore from './MatchScore'
import ApplyModal from './ApplyModal'


export default function OpportunityCard({ opportunity, isSaved, isApplied, deadlineUrgency, onToggleSave, onLogView, onTrackApplication }) {
  const { isMobile } = useResponsive()
  const [showModal, setShowModal] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [copied, setCopied] = useState(false)
  const { type, title, org_name, description, deadline, amount } = opportunity
  const matchScore = opportunity._matchScore ?? null
  const [showApplyModal, setShowApplyModal] = useState(false)

  const handleViewDetails = () => { onLogView(opportunity.id); setShowModal(true) }

  const typeConfig = {
    scholarship: { bg: 'rgba(63,185,80,0.12)', color: '#3fb950', label: 'Scholarship' },
    competition:  { bg: 'rgba(99,102,241,0.12)', color: '#818cf8', label: 'Competition' },
    internship:   { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b', label: 'Internship' },
    program:      { bg: 'rgba(168,85,247,0.12)', color: '#c084fc', label: 'Program' },
    grant:        { bg: 'rgba(248,81,73,0.12)', color: '#f85149', label: 'Grant' },
  }
  const cfg = typeConfig[type] || { bg: 'rgba(125,133,144,0.12)', color: '#7d8590', label: type }

  return (
    <>
      <div className="v-card" style={{
        backgroundColor: '#161b22',
        border: deadlineUrgency === 'urgent'
          ? '1.5px solid rgba(248,81,73,0.4)'
          : '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: isMobile ? COMPONENT.opCard.mobilePadding : COMPONENT.opCard.desktopPadding,
        display: 'flex', flexDirection: 'column',
        cursor: 'pointer', overflow: 'hidden',
        position: 'relative',
      }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        onClick={handleViewDetails}
      >
        {/* Urgency banner */}
        {(deadlineUrgency === 'urgent' || deadlineUrgency === 'soon') && (
          <div style={{
            padding: '7px 16px', fontSize: '11px', fontWeight: '700', letterSpacing: '0.3px',
            backgroundColor: deadlineUrgency === 'urgent' ? 'rgba(248,81,73,0.12)' : 'rgba(245,158,11,0.10)',
            color: deadlineUrgency === 'urgent' ? '#f85149' : '#f59e0b',
            borderBottom: deadlineUrgency === 'urgent' ? '1px solid rgba(248,81,73,0.2)' : '1px solid rgba(245,158,11,0.15)',
          }}>
            {deadlineUrgency === 'urgent' ? '● Closing very soon' : '● Deadline this week'}
          </div>
        )}

            <div style={{ padding: '0', display: 'flex', flexDirection: 'column', gap: isMobile ? COMPONENT.opCard.mobileGap : COMPONENT.opCard.desktopGap, flex: 1 }}>
            {/* Top row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: cfg.bg, color: cfg.color }}>
                {cfg.label}
              </span>
              {matchScore !== null && <MatchScore score={matchScore} compact />}
            </div>
            <button onClick={(e) => { e.stopPropagation(); onToggleSave(opportunity.id) }} style={{
              background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer',
              color: isSaved ? '#f59e0b' : '#484f58', transition: 'all 0.2s ease', padding: '2px',
              transform: isHovering ? 'scale(1.15)' : 'scale(1)',
            }}>
              {isSaved ? '★' : '☆'}
            </button>
          </div>

          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>{title}</h3>
          <p style={{ fontSize: '12px', color: '#7d8590', fontWeight: '500', margin: 0 }}>{org_name}</p>
          <p style={{ fontSize: '13px', color: '#7d8590', lineHeight: 1.6, margin: 0, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{description}</p>

          {/* Footer */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: 'auto' }}>
            {deadline && (
              <span style={{ fontSize: '12px', fontWeight: '600', color: deadlineUrgency === 'urgent' ? '#f85149' : deadlineUrgency === 'soon' ? '#f59e0b' : '#484f58' }}>
                📅 {new Date(deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {amount > 0 && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#3fb950' }}>
                💰 {amount === 1 ? 'Varies' : `$${amount.toLocaleString()}`}
              </span>
            )}
          </div>
            
          {/* Hover CTA */}
          {isHovering && (
            <div style={{ display: 'flex', gap: '8px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)', animation: 'slideUp 0.2s ease' }}>
                <button style={{ flex: 1, minHeight: COMPONENT.button.minHeight, padding: COMPONENT.button.padding, backgroundColor: COLORS.accent, color: COLORS.bg, border: 'none', fontSize: '12px', fontWeight: '700', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit', letterSpacing: '0.2px' }}
                onClick={(e) => { e.stopPropagation(); handleViewDetails() }}>
                View details →
              </button>
              {!isApplied ? (
                <button style={{ padding: '9px 12px', backgroundColor: 'rgba(63,185,80,0.1)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.2)', fontSize: '12px', fontWeight: '600', cursor: 'pointer', borderRadius: '8px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
                  onClick={(e) => { e.stopPropagation(); setShowApplyModal(true) }}>
                  Apply →
                </button>
              ) : (
                <span style={{ padding: '9px 12px', backgroundColor: 'rgba(63,185,80,0.1)', color: '#3fb950', border: '1px solid rgba(63,185,80,0.2)', fontSize: '12px', fontWeight: '600', borderRadius: '8px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center' }}>
                  ✓ Applied
                </span>
              )}
              <button
                onClick={async (e) => {
                  e.stopPropagation()
                  const url = `${window.location.origin}/opportunities/${opportunity.id}`
                  await navigator.clipboard.writeText(url)
                  setCopied(true)
                  setTimeout(() => setCopied(false), 2000)
                }}
                style={{ padding: '9px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: copied ? 'rgba(63,185,80,0.1)' : 'transparent', color: copied ? '#3fb950' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s', whiteSpace: 'nowrap' }}>
                {copied ? '✓ Copied' : '⎘ Share'}
              </button>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <OpportunityModal
          opportunity={opportunity}
          isSaved={isSaved}
          onToggleSave={onToggleSave}
          onLogView={onLogView}
          onClose={() => setShowModal(false)}
        />
      )}
      {showApplyModal && (
        <ApplyModal
          opportunity={opportunity}
          onClose={() => setShowApplyModal(false)}
          onApplied={(id) => { onTrackApplication(id); setShowApplyModal(false) }}
        />
      )}
    </>
  )
}