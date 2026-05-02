import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'
import ResearchPaperCard from '../components/ResearchPaperCard'
import { useNavigate } from 'react-router-dom'

export default function Research() {
  const { signOut } = useAuth()
  const navigate = useNavigate()
  const [papers, setPapers] = useState([])
  const [filteredPapers, setFilteredPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    searchQuery: '',
    field: 'all',
    yearRange: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 10

  useEffect(() => {
    fetchPapers()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, papers])

  async function fetchPapers() {
    const { data, error } = await supabase
      .from('research_papers')
      .select('*')
      .order('year', { ascending: false })

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    setPapers(data || [])
    setLoading(false)
  }

  function applyFilters() {
    setCurrentPage(1)
    let result = papers

    if (filters.searchQuery.trim()) {
      const term = filters.searchQuery.toLowerCase()
      result = result.filter(paper =>
        paper.title.toLowerCase().includes(term) ||
        paper.authors.toLowerCase().includes(term) ||
        paper.abstract?.toLowerCase().includes(term)
      )
    }

    if (filters.field !== 'all') {
      result = result.filter(paper => paper.field.toLowerCase() === filters.field.toLowerCase())
    }

    if (filters.yearRange !== 'all') {
      const currentYear = new Date().getFullYear()
      if (filters.yearRange === 'recent') {
        result = result.filter(paper => paper.year && paper.year >= currentYear - 2)
      } else if (filters.yearRange === 'last5') {
        result = result.filter(paper => paper.year && paper.year >= currentYear - 5)
      }
    }

    setFilteredPapers(result)
  }

  function getUniqueFields() {
    return [...new Set(papers.map(p => p.field?.toLowerCase()))].filter(Boolean).sort()
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
      Loading research papers...
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 80px', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' }}>Research papers hub</h1>
        <p style={{ fontSize: '15px', color: '#6b7280', margin: 0 }}>Explore peer-reviewed research across AI, computer science, and more</p>
      </div>

      {/* Premium filter panel */}
      <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '20px 24px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search by title, author, or keyword..."
          value={filters.searchQuery}
          onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minWidth: '160px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Field</span>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['all', ...getUniqueFields()].map(field => (
                <button
                  key={field}
                  onClick={() => setFilters({ ...filters, field })}
                  style={{ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid', borderColor: filters.field === field ? '#064e3b' : '#e5e7eb', backgroundColor: filters.field === field ? '#064e3b' : '#fafafa', color: filters.field === field ? '#fff' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                >
                  {field === 'all' ? 'All fields' : field.charAt(0).toUpperCase() + field.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Year</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              {[{ value: 'all', label: 'Any year' }, { value: 'recent', label: 'Last 2 years' }, { value: 'last5', label: 'Last 5 years' }].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setFilters({ ...filters, yearRange: opt.value })}
                  style={{ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid', borderColor: filters.yearRange === opt.value ? '#064e3b' : '#e5e7eb', backgroundColor: filters.yearRange === opt.value ? '#064e3b' : '#fafafa', color: filters.yearRange === opt.value ? '#fff' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        {(filters.searchQuery || filters.field !== 'all' || filters.yearRange !== 'all') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setFilters({ searchQuery: '', field: 'all', yearRange: 'all' })} style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: 'transparent', color: '#6b7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              Clear all
            </button>
          </div>
        )}
      </div>

      {filteredPapers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
          <div style={{ fontSize: '40px', marginBottom: '16px' }}>📄</div>
          <p style={{ fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' }}>No papers found</p>
          <p style={{ fontSize: '14px', color: '#9ca3af', margin: 0 }}>Try a different search or filter</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', margin: 0 }}>{filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>Page {currentPage} of {Math.ceil(filteredPapers.length / ITEMS_PER_PAGE)}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
            {filteredPapers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(paper => (
              <ResearchPaperCard key={paper.id} paper={paper} />
            ))}
          </div>
          {Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginBottom: '40px', flexWrap: 'wrap' }}>
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === 1} style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
              {Array.from({ length: Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e-${i}`} style={{ color: '#9ca3af', fontSize: '13px', padding: '0 4px' }}>...</span>
                  : <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }} style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid', borderColor: currentPage === p ? '#064e3b' : '#e5e7eb', backgroundColor: currentPage === p ? '#064e3b' : '#fff', color: currentPage === p ? '#fff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                )}
              <button onClick={() => { setCurrentPage(p => Math.min(Math.ceil(filteredPapers.length / ITEMS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === Math.ceil(filteredPapers.length / ITEMS_PER_PAGE)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) ? '#f9fafb' : '#fff', color: currentPage === Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === Math.ceil(filteredPapers.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
            </div>
          )}
        </>
      )}

      <Footer />
    </div>
  )
}