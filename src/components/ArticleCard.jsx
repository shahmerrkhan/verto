export default function ArticleCard({ article, onArticleClick }) {
  const daysAgo = Math.floor((new Date() - new Date(article.published_at)) / (1000 * 60 * 60 * 24))

  let timeAgo = `${daysAgo}d ago`
  if (daysAgo === 0) timeAgo = 'Today'
  if (daysAgo === 1) timeAgo = 'Yesterday'

  return (
    <div
      style={styles.card}
      onClick={onArticleClick}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'
        e.currentTarget.style.borderColor = '#d1d5db'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.04)'
        e.currentTarget.style.borderColor = '#e5e7eb'
      }}
    >
      <div style={styles.header}>
        <h3 style={styles.title}>{article.title}</h3>
      </div>

      <p style={styles.excerpt}>{article.excerpt}</p>

      <div style={styles.footer}>
        <div style={styles.meta}>
          <span style={styles.author}>{article.author_name}</span>
          <span style={styles.dot}>{String.fromCharCode(8226)}</span>
          <span style={styles.time}>{timeAgo}</span>
        </div>
        <div style={styles.views}>{article.views} {article.views === 1 ? 'view' : 'views'}</div>
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
    cursor: 'pointer',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  header: { marginBottom: '4px' },
  title: { fontSize: '17px', fontWeight: '700', color: '#0a0a0a', margin: '0', lineHeight: 1.3, letterSpacing: '-0.3px' },
  excerpt: { fontSize: '14px', color: '#6b7280', margin: '0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  footer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f3f4f6', marginTop: '4px' },
  meta: { display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px', color: '#9ca3af' },
  author: { fontWeight: '600', color: '#374151' },
  dot: { color: '#e5e7eb' },
  time: {},
  views: { fontSize: '12px', color: '#9ca3af', fontWeight: '500', backgroundColor: '#f9fafb', padding: '3px 8px', borderRadius: '6px' },
}