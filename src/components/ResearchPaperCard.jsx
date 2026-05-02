export default function ResearchPaperCard({ paper }) {
  return (
    <div style={styles.card}>
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
          <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer" style={styles.btn}>
            Read PDF
          </a>
        )}
        {paper.source_url && (
          <a href={paper.source_url} target="_blank" rel="noopener noreferrer" style={{ ...styles.btn, backgroundColor: '#6b7280' }}>
            View source
          </a>
        )}
      </div>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: '14px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'all 0.2s ease',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' },
  title: { fontSize: '16px', fontWeight: '700', color: '#0a0a0a', margin: '0', lineHeight: 1.35, flex: 1, letterSpacing: '-0.2px' },
  year: { fontSize: '12px', fontWeight: '700', color: '#fff', backgroundColor: '#064e3b', padding: '3px 8px', borderRadius: '6px', flexShrink: 0 },
  authors: { fontSize: '13px', color: '#6b7280', margin: '0', fontStyle: 'italic', fontWeight: '500' },
  abstract: { fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: 1.65, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  meta: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  metaItem: { fontSize: '11px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '6px' },
  actions: { display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #f3f4f6' },
  btn: { display: 'inline-block', padding: '8px 16px', backgroundColor: '#064e3b', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', transition: 'all 0.2s ease', letterSpacing: '0.2px' },
}