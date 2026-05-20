import OpportunityCard from './OpportunityCard'
import { useResponsive } from '../config/responsive'


export default function RecommendedSection({ opportunities, topN = 3, saves, applications, onToggleSave, onLogView, onTrackApplication }) {
  if (opportunities.length === 0) return null
  const recommended = opportunities.slice(0, topN)
  const { isMobile } = useResponsive()

  function getDaysUntilDeadline(deadline) {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  }

  function getDeadlineUrgency(days) {
    if (days === null) return 'normal'
    if (days < 0) return 'expired'
    if (days <= 3) return 'urgent'
    if (days <= 7) return 'soon'
    return 'normal'
  }

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: 0, fontFamily: "'Syne', sans-serif" }}>Recommended for you</h2>
        <span style={{ fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '20px', color: '#f59e0b' }}>AI matched</span>
      </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '14px' }}>
        {recommended.map(op => (
          <OpportunityCard
            key={op.id}
            opportunity={op}
            isSaved={saves.includes(op.id)}
            isApplied={applications.includes(op.id)}
            onToggleSave={onToggleSave}
            onLogView={onLogView}
            onTrackApplication={onTrackApplication}
            deadlineUrgency={getDeadlineUrgency(getDaysUntilDeadline(op.deadline))}
          />
        ))}
      </div>
    </div>
  )
}

