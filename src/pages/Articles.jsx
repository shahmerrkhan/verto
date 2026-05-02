import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'
import ArticleCard from '../components/ArticleCard'
import { useNavigate } from 'react-router-dom'

export default function Articles() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [articles, setArticles] = useState([])
  const [filteredArticles, setFilteredArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10
  useEffect(() => {
    fetchArticles()
  }, [])

  useEffect(() => {
    applyFiltersAndSort()
  }, [searchQuery, sortBy, articles])

  async function fetchArticles() {
    const { data, error } = await supabase
      .from('articles')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setArticles(data || [])
    setLoading(false)
  }

  function applyFiltersAndSort() {
    setCurrentPage(1)
    let result = articles

    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase()
      result = result.filter(article =>
        article.title.toLowerCase().includes(term) ||
        article.excerpt?.toLowerCase().includes(term) ||
        article.author_name.toLowerCase().includes(term)
      )
    }

    if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
    } else if (sortBy === 'popular') {
      result.sort((a, b) => b.views - a.views)
    }

    setFilteredArticles(result)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
      Loading articles...
    </div>
  )

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '80px 24px 80px' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={styles.title}>Community articles</h1>
          <p style={styles.subtitle}>Learn from students like you. Share your wisdom.</p>
        </div>
        <button
          style={styles.submitBtn}
          onClick={() => navigate('/submit-article')}
          onMouseEnter={e => { e.target.style.backgroundColor = '#0d5a47' }}
          onMouseLeave={e => { e.target.style.backgroundColor = '#064e3b' }}
        >
          ✏ Write article
        </button>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input
          type="text"
          placeholder="Search by title, author, or keyword..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Sort</span>
          <div style={{ display: 'flex', gap: '6px' }}>
            {[{ value: 'newest', label: 'Newest first' }, { value: 'popular', label: 'Most viewed' }].map(opt => (
              <button
                key={opt.value}
                onClick={() => setSortBy(opt.value)}
                style={{ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid', borderColor: sortBy === opt.value ? '#064e3b' : '#e5e7eb', backgroundColor: sortBy === opt.value ? '#064e3b' : '#fafafa', color: sortBy === opt.value ? '#fff' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>📝</div>
          <p style={styles.emptyTitle}>No articles found</p>
          <p style={styles.emptySubtext}>{searchQuery ? 'Try a different search' : 'Be the first to write one'}</p>
        </div>
      ) : (
        <>
          <p style={styles.resultCount}>{filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''}</p>
          <div style={styles.articleList}>
            {filteredArticles.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(article => (
              <ArticleCard
                key={article.id}
                article={article}
                onArticleClick={() => navigate(`/articles/${article.id}`)}
              />
            ))}
          </div>
        </>
      )}

{Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                ← Prev
              </button>
              {Array.from({ length: Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e-${i}`} style={{ color: '#9ca3af', fontSize: '13px', padding: '0 4px' }}>...</span>
                  : <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid', borderColor: currentPage === p ? '#064e3b' : '#e5e7eb', backgroundColor: currentPage === p ? '#064e3b' : '#fff', color: currentPage === p ? '#fff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {p}
                    </button>
                )}
              <button
                onClick={() => { setCurrentPage(p => Math.min(Math.ceil(filteredArticles.length / ITEMS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === Math.ceil(filteredArticles.length / ITEMS_PER_PAGE)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) ? '#f9fafb' : '#fff', color: currentPage === Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Next →
              </button>
            </div>
          )}
        <Footer />
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
submitBtn: { padding: '10px 18px', borderRadius: '10px', background: 'linear-gradient(135deg, #064e3b 0%, #0d5a47 100%)', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit', boxShadow: '0 4px 12px rgba(6, 78, 59, 0.2)' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  controls: { display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' },
  searchInput: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', flex: '1', minWidth: '200px', fontFamily: 'inherit' },
  sortSelect: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff', cursor: 'pointer' },
  resultCount: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '20px' },
  articleList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '40px' },
  emptyState: { textAlign: 'center', padding: '60px 24px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px dashed #d1d5db' },
  emptyIcon: { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' },
  emptySubtext: { fontSize: '14px', color: '#9ca3af', margin: 0 },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '100px 16px 40px 16px',
  },
}

const mediaQuery = `
  @media (max-width: 640px) {
    .container { padding: 100px 12px 40px 12px !important; }
    .grid { grid-template-columns: 1fr !important; }
  }
  @media (min-width: 641px) and (max-width: 1024px) {
    .grid { grid-template-columns: repeat(2, 1fr) !important; }
  }
`