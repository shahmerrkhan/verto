import OpportunityCard from './OpportunityCard'

export default function RecommendedSection({ opportunities, topN = 3, saves, applications, onToggleSave, onLogView, onTrackApplication }) {
  if (opportunities.length === 0) return null
  const recommended = opportunities.slice(0, topN)

  return (
    <div style={{ marginBottom: '32px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'baseline', gap: '10px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: 0, fontFamily: "'Syne', sans-serif" }}>Recommended for you</h2>
        <span style={{ fontSize: '11px', color: '#484f58', fontWeight: '600', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)', padding: '2px 8px', borderRadius: '20px', color: '#f59e0b' }}>AI matched</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: '14px' }}>
        {recommended.map(op => (
          <OpportunityCard key={op.id} opportunity={op} isSaved={saves.includes(op.id)} isApplied={applications.includes(op.id)} onToggleSave={onToggleSave} onLogView={onLogView} onTrackApplication={onTrackApplication} />
        ))}
      </div>
    </div>
  )
}