import OpportunityCard from './OpportunityCard'

    export default function RecommendedSection({ opportunities, topN = 3, saves, applications, onToggleSave, onLogView, onTrackApplication }) {
    if (opportunities.length === 0) return null

  const recommended = opportunities.slice(0, topN)

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Recommended for you</h2>
        <p style={styles.subtitle}>Based on your profile</p>
      </div>

      <div style={styles.grid}>
        {recommended.map(op => (
          <OpportunityCard
            key={op.id}
            opportunity={op}
            isSaved={saves.includes(op.id)}
            isApplied={applications.includes(op.id)}
            onToggleSave={onToggleSave}
            onLogView={onLogView}
            onTrackApplication={onTrackApplication}
          />
        ))}
      </div>
    </div>
  )
}

const styles = {
  container: {
    marginBottom: '32px',
  },
  header: {
    marginBottom: '24px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1a1a1a',
    margin: '0 0 4px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0',
  },
grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(340px, 100%), 1fr))',
  gap: '16px',
},
}