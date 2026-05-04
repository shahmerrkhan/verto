import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'
import ArticleCard from '../components/ArticleCard'
import { useNavigate } from 'react-router-dom'

const ITEMS_PER_PAGE = 10

export default function Articles() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { fetchArticles() }, [])
  useEffect(() => { applyFiltersAndSort() }, [searchQuery, sortBy, articles])

  async function fetchArticles() {
    const { data, error } = await supabase.from('articles').select('*').eq('status', 'published').order('published_at', { ascending: false })
    if (error) { console.error(error); setLoading(false); return }
    setArticles(data || []); setLoading(false)
  }

  function applyFiltersAndSort() {
    setCurrentPage(1)
    let result = [...articles]
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase()
      result = result.filter(a => a.title.toLowerCase().includes(term) || a.excerpt?.toLowerCase().includes(term) || a.author_name.toLowerCase().includes(term))
    }
    if (sortBy === 'newest') result.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    else if (sortBy === 'popular') result.sort((a, b) => b.views - a.views)
    setFilteredArticles(result)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', color: '#7d8590', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>
      Loading articles...
    </div>
  )

  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Community articles</h1>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Learn from students like you. Share your wisdom.</p>
        </div>
        <button onClick={() => navigate('/submit-article')} style={{ padding: '10px 18px', borderRadius: '10px', backgroundColor: '#f59e0b', color: '#0d1117', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', whiteSpace: 'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)' }}>
          ✏ Write article
        </button>
      </div>

      <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <input type="text" placeholder="Search by title, author, or keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Sort</span>
          {[{ value: 'newest', label: 'Newest first' }, { value: 'popular', label: 'Most viewed' }].map(opt => (
            <button key={opt.value} onClick={() => setSortBy(opt.value)} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', borderColor: sortBy === opt.value ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: sortBy === opt.value ? 'rgba(245,158,11,0.1)' : 'transparent', color: sortBy === opt.value ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#161b22', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>No articles found</p>
          <p style={{ fontSize: '14px', color: '#484f58', margin: 0 }}>{searchQuery ? 'Try a different search' : 'Be the first to write one'}</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#7d8590', marginBottom: '16px' }}>{filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '32px' }}>
            {filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(article => (
              <ArticleCard key={article.id} article={article} onArticleClick={() => navigate(`/articles/${article.id}`)} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', color: currentPage === 1 ? '#484f58' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e-${i}`} style={{ color: '#484f58' }}>...</span>
                  : <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid', borderColor: currentPage === p ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: currentPage === p ? 'rgba(245,158,11,0.1)' : '#161b22', color: currentPage === p ? '#f59e0b' : '#e6edf3', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>)}
              <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', color: currentPage === totalPages ? '#484f58' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
            </div>
          )}
        </>
      )}
      <Footer />
    </div>
  )
}