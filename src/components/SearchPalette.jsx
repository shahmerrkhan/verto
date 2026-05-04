import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function SearchPalette({ onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ opportunities: [], courses: [], articles: [], research: [] })
  const [loading, setLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    if (!query.trim()) {
      setResults({ opportunities: [], courses: [], articles: [], research: [] })
      return
    }
    const timer = setTimeout(() => search(query.trim()), 200)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    setSelectedIndex(0)
  }, [results])

  async function search(term) {
    setLoading(true)
    const like = `%${term}%`

    const [oppsRes, coursesRes, articlesRes, researchRes] = await Promise.all([
      supabase.from('opportunities').select('id, title, org_name, type').eq('is_active', true).or(`title.ilike.${like},org_name.ilike.${like},description.ilike.${like}`).limit(4),
      supabase.from('courses').select('id, title, provider, platform').eq('is_active', true).or(`title.ilike.${like},provider.ilike.${like},description.ilike.${like}`).limit(3),
      supabase.from('articles').select('id, title, author_name').eq('status', 'published').or(`title.ilike.${like},excerpt.ilike.${like},author_name.ilike.${like}`).limit(3),
      supabase.from('research_papers').select('id, title, authors, field').or(`title.ilike.${like},authors.ilike.${like},abstract.ilike.${like}`).limit(3),
    ])

    setResults({
      opportunities: oppsRes.data || [],
      courses: coursesRes.data || [],
      articles: articlesRes.data || [],
      research: researchRes.data || [],
    })
    setLoading(false)
  }

  const allResults = [
    ...results.opportunities.map(r => ({ ...r, category: 'opportunity', label: r.title, sub: r.org_name, path: `/opportunities/${r.id}`, icon: typeIcon(r.type) })),
    ...results.courses.map(r => ({ ...r, category: 'course', label: r.title, sub: r.provider, path: `/courses`, icon: '🎓' })),
    ...results.articles.map(r => ({ ...r, category: 'article', label: r.title, sub: r.author_name, path: `/articles/${r.id}`, icon: '✍️' })),
    ...results.research.map(r => ({ ...r, category: 'research', label: r.title, sub: r.authors, path: `/research`, icon: '🔬' })),
  ]

  function typeIcon(type) {
    const icons = { scholarship: '🎓', competition: '🏆', internship: '💼', program: '📋', grant: '💰' }
    return icons[type] || '◎'
  }

  function handleSelect(result) {
    navigate(result.path)
    onClose()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') { onClose(); return }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIndex(i => Math.min(i + 1, allResults.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIndex(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && allResults[selectedIndex]) { handleSelect(allResults[selectedIndex]) }
  }

  const categoryLabels = {
    opportunity: 'Opportunities',
    course: 'Courses',
    article: 'Articles',
    research: 'Research',
  }

  const categoryColors = {
    opportunity: { color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
    course: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    article: { color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
    research: { color: '#c084fc', bg: 'rgba(192,132,252,0.1)' },
  }

  const hasResults = allResults.length > 0
  const isEmpty = query.trim() && !loading && !hasResults

  let globalIndex = 0

  return (
    <div
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9000, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '80px 20px 20px', animation: 'fadeIn 0.15s ease' }}
      onClick={onClose}
    >
      <div
        style={{ width: '100%', maxWidth: '620px', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', animation: 'slideDown 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <span style={{ fontSize: '16px', color: '#484f58', flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search opportunities, courses, articles, research..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: '15px', color: '#e6edf3', fontFamily: 'DM Sans, sans-serif', caretColor: '#f59e0b' }}
          />
          {loading && (
            <div style={{ width: '16px', height: '16px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
          )}
          <kbd style={{ padding: '3px 7px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', color: '#484f58', fontSize: '11px', fontFamily: 'inherit', flexShrink: 0 }}>Esc</kbd>
        </div>

        {/* Results */}
        <div style={{ maxHeight: '460px', overflowY: 'auto' }}>
          {!query.trim() && (
            <div style={{ padding: '32px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '13px', color: '#484f58', margin: 0 }}>Start typing to search across everything</p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '16px', flexWrap: 'wrap' }}>
                {['Scholarship', 'Waterloo', 'Python', 'Machine Learning'].map(hint => (
                  <button key={hint} onClick={() => setQuery(hint)} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#7d8590', fontSize: '12px', cursor: 'pointer', fontFamily: 'inherit', fontWeight: '500' }}>
                    {hint}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isEmpty && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>No results for "{query}"</p>
              <p style={{ fontSize: '13px', color: '#484f58', margin: 0 }}>Try a different keyword</p>
            </div>
          )}

          {hasResults && (() => {
            const rendered = []
            let prevCategory = null

            allResults.forEach((result, idx) => {
              const isSelected = idx === selectedIndex
              const cc = categoryColors[result.category]

              if (result.category !== prevCategory) {
                rendered.push(
                  <div key={`cat-${result.category}`} style={{ padding: '10px 20px 6px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {categoryLabels[result.category]}
                  </div>
                )
                prevCategory = result.category
              }

              rendered.push(
                <button
                  key={result.id + result.category}
                  onClick={() => handleSelect(result)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 20px', border: 'none', backgroundColor: isSelected ? 'rgba(245,158,11,0.06)' : 'transparent', cursor: 'pointer', textAlign: 'left', transition: 'background 0.1s', borderLeft: isSelected ? '2px solid #f59e0b' : '2px solid transparent', fontFamily: 'inherit' }}
                >
                  <span style={{ width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', backgroundColor: cc.bg, flexShrink: 0 }}>
                    {result.icon}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: isSelected ? '#e6edf3' : '#b1bac4', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.label}</p>
                    {result.sub && <p style={{ fontSize: '11px', color: '#484f58', margin: '2px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.sub}</p>}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: cc.color, backgroundColor: cc.bg, padding: '3px 8px', borderRadius: '20px', flexShrink: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {result.category}
                  </span>
                </button>
              )
            })

            return rendered
          })()}
        </div>

        {/* Footer hint */}
        {hasResults && (
          <div style={{ padding: '10px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '16px', alignItems: 'center' }}>
            {[['↑↓', 'navigate'], ['↵', 'open'], ['Esc', 'close']].map(([key, label]) => (
              <span key={key} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#484f58' }}>
                <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '10px', color: '#7d8590', fontFamily: 'inherit' }}>{key}</kbd>
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}