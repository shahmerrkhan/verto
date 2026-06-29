import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import CourseCard from '../components/CourseCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { useResponsive } from '../config/responsive'

const ITEMS_PER_PAGE = 9

export default function Courses() {
  const { isMobile } = useResponsive()
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ searchQuery: '', skillLevel: 'all', platform: 'all', topic: 'all' })
  const [currentPage, setCurrentPage] = useState(1)

  const platformLogos = { coursera: '🎓', edx: '📚', udemy: '👨‍💼', skillshare: '🎨', codecademy: '💻', other: '🌐' }

  useEffect(() => { fetchCourses() }, [])
  useEffect(() => { applyFilters() }, [filters, courses])

  async function fetchCourses() {
    const res = await fetch('/api/courses')
    const data = await res.json()
    setCourses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  function applyFilters() {
    setCurrentPage(1)
    let result = courses
    if (filters.searchQuery.trim()) {
      const term = filters.searchQuery.toLowerCase()
      result = result.filter(c => c.title.toLowerCase().includes(term) || c.description?.toLowerCase().includes(term) || c.provider?.toLowerCase().includes(term))
    }
    if (filters.skillLevel !== 'all') result = result.filter(c => c.skill_level === filters.skillLevel)
    if (filters.platform !== 'all') result = result.filter(c => c.platform.toLowerCase() === filters.platform)
    if (filters.topic !== 'all') result = result.filter(c => c.topic.toLowerCase() === filters.topic)
    setFilteredCourses(result)
  }

  const getUnique = (key) => [...new Set(courses.map(c => c[key]?.toLowerCase()))].filter(Boolean).sort()

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px 80px' }}>
      <div style={{ marginBottom: '32px' }}>
        <div style={{ width: '200px', height: '28px', backgroundColor: '#161b22', borderRadius: '8px', marginBottom: '8px' }} />
        <div style={{ width: '300px', height: '14px', backgroundColor: '#161b22', borderRadius: '6px' }} />
      </div>
      <LoadingSkeleton count={6} />
    </div>
  )

  const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)

  return (
<div style={{ maxWidth: '1200px', margin: '0 auto', padding: isMobile ? '80px 16px 60px' : '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Skill-building courses</h1>
        <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Learn from industry leaders — curated for high school students</p>
      </div>

      {/* Filter panel */}
      <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <input type="text" placeholder="Search courses, providers..." value={filters.searchQuery} onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />

        {[
          { label: 'Level', key: 'skillLevel', options: [{ value: 'all', label: 'All levels' }, { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }] },
          { label: 'Platform', key: 'platform', options: [{ value: 'all', label: 'All platforms' }, ...getUnique('platform').map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))] },
          { label: 'Topic', key: 'topic', options: [{ value: 'all', label: 'All topics' }, ...getUnique('topic').map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))] },
        ].map(row => (
          <div key={row.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '60px', paddingTop: '6px', flexShrink: 0 }}>{row.label}</span>
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
              {row.options.map(opt => (
                <button key={opt.value} onClick={() => setFilters({ ...filters, [row.key]: opt.value })} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px solid', borderColor: filters[row.key] === opt.value ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: filters[row.key] === opt.value ? 'rgba(245,158,11,0.1)' : 'transparent', color: filters[row.key] === opt.value ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        ))}

        {(filters.searchQuery || filters.skillLevel !== 'all' || filters.platform !== 'all' || filters.topic !== 'all') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setFilters({ searchQuery: '', skillLevel: 'all', platform: 'all', topic: 'all' })} style={{ padding: '6px 14px', borderRadius: '8px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Clear all</button>
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 24px', backgroundColor: '#161b22', borderRadius: '14px', border: '1px dashed rgba(255,255,255,0.08)' }}>
          <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>No courses found</p>
          <p style={{ fontSize: '14px', color: '#484f58', margin: 0 }}>Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <p style={{ fontSize: '13px', fontWeight: '600', color: '#7d8590', marginBottom: '16px' }}>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: isMobile ? '10px' : '14px', marginBottom: '32px' }}>
              {filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(course => (
              <CourseCard key={course.id} course={course} platformLogo={platformLogos[course.platform?.toLowerCase()] || '🌐'} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', color: currentPage === 1 ? '#484f58' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e-${i}`} style={{ color: '#484f58', fontSize: '13px' }}>...</span>
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