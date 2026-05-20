import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'
import ResearchPaperCard from '../components/ResearchPaperCard'
import { useResponsive } from '../config/responsive'

const ITEMS_PER_PAGE = 10

export default function Research() {
  const { isMobile } = useResponsive()
  const [papers, setPapers] = useState([])
  const [filteredPapers, setFilteredPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ searchQuery: '', field: 'all', yearRange: 'all' })
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => { fetchPapers() }, [])
  useEffect(() => { applyFilters() }, [filters, papers])

  async function fetchPapers() {
    const { data, error } = await supabase.from('research_papers').select('*').order('year', { ascending: false })
    if (error) { console.error(error); setLoading(false); return }
    setPapers(data || []); setLoading(false)
  }

  function applyFilters() {
    setCurrentPage(1)
    let result = papers
    if (filters.searchQuery.trim()) {
      const term = filters.searchQuery.toLowerCase()
      result = result.filter(p => p.title.toLowerCase().includes(term) || p.authors.toLowerCase().includes(term) || p.abstract?.toLowerCase().includes(term))
    }
    if (filters.field !== 'all') result = result.filter(p => p.field?.toLowerCase() === filters.field)
    if (filters.yearRange !== 'all') {
      const y = new Date().getFullYear()
      if (filters.yearRange === 'recent') result = result.filter(p => p.year && p.year >= y - 2)
      else if (filters.yearRange === 'last5') result = result.filter(p => p.year && p.year >= y - 5)
    }
    setFilteredPapers(result)
  }

  const getUniqueFields = () => [...new Set(papers.map(p => p.field?.toLowerCase()))].filter(Boolean).sort()

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', color: '#7d8590', fontSize: '14px', fontFamily: 'DM Sans, sans-serif' }}>Loading research papers...</div>
  )

  const totalPages = Math.ceil(filteredPapers.length / ITEMS_PER_PAGE)

  return (
<div style={{ maxWidth: '1100px', margin: '0 auto', padding: isMobile ? '80px 16px 60px' : '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Research papers hub</h1>
        <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Explore peer-reviewed research across AI, computer science, and more</p>
      </div>

      <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input type="text" placeholder="Search by title, author, or keyword..." value={filters.searchQuery} onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
          {[
            { label: 'Field', key: 'field', opts: [{ v: 'all', l: 'All fields' }, ...getUniqueFields().map(f => ({ v: f, l: f.charAt(0).toUpperCase() + f.slice(1) }))] },
            { label: 'Year', key: 'yearRange', opts: [{ v: 'all', l: 'Any year' }, { v: 'recent', l: 'Last 2 years' }, { v: 'last5', l: 'Last 5 years' }] },
          ].map(row => (
            <div key={row.key} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{row.label}</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {row.opts.map(opt => (
                  <button key={opt.v} onClick={() => setFilters({ ...filters, [row.key]: opt.v })} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', borderColor: filters[row.key] === opt.v ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: filters[row.key] === opt.v ? 'rgba(245,158,11,0.1)' : 'transparent', color: filters[row.key] === opt.v ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                    {opt.l}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {(filters.searchQuery || filters.field !== 'all' || filters.yearRange !== 'all') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setFilters({ searchQuery: '', field: 'all', yearRange: 'all' })} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Clear all</button>
          </div>
        )}
      </div>

      {filteredPapers.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#161b22', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>No papers found</p>
          <p style={{ fontSize: '14px', color: '#484f58', margin: 0 }}>Try a different search or filter</p>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#7d8590', margin: 0 }}>{filteredPapers.length} paper{filteredPapers.length !== 1 ? 's' : ''}</p>
            <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>Page {currentPage} of {totalPages}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
            {filteredPapers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(paper => (
              <ResearchPaperCard key={paper.id} paper={paper} />
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