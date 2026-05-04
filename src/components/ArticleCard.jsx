export default function ArticleCard({ article, onArticleClick }) {
  const daysAgo = Math.floor((new Date() - new Date(article.published_at)) / (1000 * 60 * 60 * 24))
  let timeAgo = `${daysAgo}d ago`
  if (daysAgo === 0) timeAgo = 'Today'
  if (daysAgo === 1) timeAgo = 'Yesterday'

  return (
    <div onClick={onArticleClick} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px', transition: 'all 0.2s ease', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.4)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
      <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>{article.title}</h3>
      <p style={{ fontSize: '13px', color: '#7d8590', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.excerpt}</p>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', marginTop: '4px' }}>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', fontSize: '12px' }}>
          <span style={{ fontWeight: '700', color: '#b1bac4' }}>{article.author_name}</span>
          <span style={{ color: '#484f58' }}>·</span>
          <span style={{ color: '#484f58' }}>{timeAgo}</span>
        </div>
        <span style={{ fontSize: '11px', color: '#484f58', fontWeight: '500', backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>{article.views} views</span>
      </div>
    </div>
  )
}