export default function LoadingSkeleton({ count = 3 }) {
  return (
    <div style={styles.skeletonContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={styles.skeletonCard}>
          <div style={styles.skeletonHeader} />
          <div style={styles.skeletonLine} />
          <div style={{ ...styles.skeletonLine, width: '70%' }} />
          <div style={{ ...styles.skeletonLine, width: '50%', marginBottom: '12px' }} />
          <div style={styles.skeletonButton} />
        </div>
      ))}
    </div>
  )
}

const styles = {
  skeletonContainer: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' },
  skeletonCard: { backgroundColor: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  skeletonHeader: { width: '40%', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '6px', animation: 'pulse 2s infinite' },
  skeletonLine: { width: '100%', height: '14px', backgroundColor: '#e5e7eb', borderRadius: '6px', animation: 'pulse 2s infinite' },
  skeletonButton: { width: '100%', height: '40px', backgroundColor: '#e5e7eb', borderRadius: '8px', marginTop: '8px', animation: 'pulse 2s infinite' },
}

// Add this to your global CSS or create a style tag
const keyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`