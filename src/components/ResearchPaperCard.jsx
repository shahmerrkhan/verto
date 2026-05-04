export default function ResearchPaperCard({ paper }) {
  return (
    <div style={styles.card}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
      <div style={styles.header}>
        <h3 style={styles.title}>{paper.title}</h3>
        {paper.year && <span style={styles.year}>{paper.year}</span>}
      </div>

      <p style={styles.authors}>{paper.authors}</p>

      {paper.abstract && (
        <p style={styles.abstract}>{paper.abstract}</p>
      )}

      <div style={styles.meta}>
        {paper.field && <span style={styles.metaItem}>{paper.field}</span>}
        {paper.doi && <span style={styles.metaItem}>DOI: {paper.doi}</span>}
      </div>

      <div style={styles.actions}>
        {paper.pdf_url && (
          <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={styles.btnPrimary}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)' }}>
            Read PDF
          </a>
        )}
        {paper.source_url && (
          <a href={paper.source_url} target="_blank" rel="noopener noreferrer" style={styles.btnSecondary}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'; e.currentTarget.style.color = '#e6edf3' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#7d8590' }}>
            View source
          </a>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#161b22',
    border: '1px solid rgba(255,255,255,0.07)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '16px',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#e6edf3',
    margin: 0,
    lineHeight: 1.35,
    flex: 1,
    letterSpacing: '-0.2px',
    fontFamily: "'Syne', sans-serif",
  },
  year: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#0d1117',
    backgroundColor: '#f59e0b',
    padding: '3px 9px',
    borderRadius: '6px',
    flexShrink: 0,
    letterSpacing: '0.3px',
  },
  authors: {
    fontSize: '13px',
    color: '#7d8590',
    margin: 0,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  abstract: {
    fontSize: '13px',
    color: '#7d8590',
    margin: 0,
    lineHeight: 1.65,
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  meta: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  metaItem: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#7d8590',
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.06)',
    padding: '3px 8px',
    borderRadius: '6px',
  },
  actions: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    paddingTop: '12px',
    borderTop: '1px solid rgba(255,255,255,0.05)',
  },
  btnPrimary: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: '#f59e0b',
    color: '#0d1117',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '700',
    transition: 'all 0.2s ease',
    letterSpacing: '0.2px',
  },
  btnSecondary: {
    display: 'inline-block',
    padding: '8px 16px',
    backgroundColor: 'transparent',
    color: '#7d8590',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    border: '1px solid rgba(255,255,255,0.08)',
  },
}