import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'
import CourseCard from '../components/CourseCard'
import { useNavigate } from 'react-router-dom'
import LoadingSkeleton from '../components/LoadingSkeleton'


export default function Courses() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [filteredCourses, setFilteredCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    searchQuery: '',
    skillLevel: 'all',
    platform: 'all',
    topic: 'all'
  })
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 9

  const platformLogos = {
    coursera: '🎓',
    edx: '📚',
    udemy: '👨‍💼',
    skillshare: '🎨',
    codecademy: '💻',
    other: '🌐'
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [filters, courses])

  async function fetchCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    console.log('Courses fetched:', data, error)

    if (error) {
      console.error('Error fetching courses:', error)
      setLoading(false)
      return
    }

    setCourses(data || [])
    setLoading(false)
  }

 function applyFilters() {
    setCurrentPage(1)
    let result = courses

    if (filters.searchQuery.trim()) {
      const term = filters.searchQuery.toLowerCase()
      result = result.filter(course =>
        course.title.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term) ||
        course.provider?.toLowerCase().includes(term)
      )
    }

    if (filters.skillLevel !== 'all') {
      result = result.filter(course => course.skill_level === filters.skillLevel)
    }

    if (filters.platform !== 'all') {
      result = result.filter(course => course.platform.toLowerCase() === filters.platform.toLowerCase())
    }

    if (filters.topic !== 'all') {
      result = result.filter(course => course.topic.toLowerCase() === filters.topic.toLowerCase())
    }

    setFilteredCourses(result)
  }

  function getUniquePlatforms() {
    return [...new Set(courses.map(c => c.platform.toLowerCase()))].sort()
  }

  function getUniqueTopics() {
    return [...new Set(courses.map(c => c.topic.toLowerCase()))].sort()
  }

  if (loading) return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px' }}>
      <div style={{ marginBottom: '40px', marginTop: '32px' }}>
        <div style={{ width: '200px', height: '32px', backgroundColor: '#e5e7eb', borderRadius: '8px', marginBottom: '8px' }} />
        <div style={{ width: '300px', height: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
      </div>
      <LoadingSkeleton count={6} />
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 80px' }}>

      <div style={styles.pageTitle}>
        <h1 style={styles.title}>Skill-building courses</h1>
        <p style={styles.subtitle}>Learn from industry leaders — curated for high school students</p>
      </div>

      <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '20px 24px', marginBottom: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <input
          type="text"
          placeholder="Search courses, providers..."
          value={filters.searchQuery}
          onChange={e => setFilters({ ...filters, searchQuery: e.target.value })}
          style={{ width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box' }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Level', key: 'skillLevel', options: [{ value: 'all', label: 'All levels' }, { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' }, { value: 'advanced', label: 'Advanced' }] },
            { label: 'Platform', key: 'platform', options: [{ value: 'all', label: 'All platforms' }, ...getUniquePlatforms().map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) }))] },
            { label: 'Topic', key: 'topic', options: [{ value: 'all', label: 'All topics' }, ...getUniqueTopics().map(t => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1) }))] },
          ].map(row => (
            <div key={row.key} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '11px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.6px', minWidth: '64px', paddingTop: '6px', flexShrink: 0 }}>{row.label}</span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {row.options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilters({ ...filters, [row.key]: opt.value })}
                    style={{ padding: '5px 12px', borderRadius: '20px', border: '1.5px solid', borderColor: filters[row.key] === opt.value ? '#064e3b' : '#e5e7eb', backgroundColor: filters[row.key] === opt.value ? '#064e3b' : '#fafafa', color: filters[row.key] === opt.value ? '#fff' : '#374151', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap', transition: 'all 0.15s ease' }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {(filters.searchQuery || filters.skillLevel !== 'all' || filters.platform !== 'all' || filters.topic !== 'all') && (
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => setFilters({ searchQuery: '', skillLevel: 'all', platform: 'all', topic: 'all' })} style={{ padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: 'transparent', color: '#6b7280', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Clear all</button>
          </div>
        )}
      </div>

      {filteredCourses.length === 0 ? (
        <div style={styles.emptyState}>
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '16px' }}>
            <rect x="10" y="12" width="28" height="36" rx="2" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
            <rect x="42" y="12" width="28" height="36" rx="2" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1.5"/>
            <line x1="14" y1="20" x2="34" y2="20" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="26" x2="34" y2="26" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="14" y1="32" x2="26" y2="32" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="46" y1="20" x2="66" y2="20" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="46" y1="26" x2="66" y2="26" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="46" y1="32" x2="58" y2="32" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="40" cy="60" r="14" fill="#f0fdf4" stroke="#d1fae5" strokeWidth="2"/>
            <path d="M36 60l2 2 6-6" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <p style={styles.emptyTitle}>No courses found</p>
          <p style={styles.emptySubtext}>Try adjusting your filters to find what you're looking for</p>
        </div>
      ) : (
        <>
          <p style={styles.resultCount}>{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''} found</p>
          <div style={styles.courseGrid}>
            {filteredCourses.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(course => (
                <div
                    key={course.id}
                    style={styles.cardWrapper}
                    onMouseEnter={e => {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.12)'
                    }}
                    onMouseLeave={e => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.08)'
                    }}
                >
                    <CourseCard
                    course={course}
                    platformLogo={platformLogos[course.platform.toLowerCase()] || '🌐'}
                    />
                </div>
                ))}
          </div>
        </>
      )}

{Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                ← Prev
              </button>
              {Array.from({ length: Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || Math.abs(p - currentPage) <= 1)
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
                onClick={() => { setCurrentPage(p => Math.min(Math.ceil(filteredCourses.length / ITEMS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) ? '#f9fafb' : '#fff', color: currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
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
  backBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  signOutBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  pageTitle: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  filterSection: { display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' },
  searchInput: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', flex: '1', minWidth: '200px', fontFamily: 'inherit' },
  filterSelect: { padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#fff', cursor: 'pointer' },
  clearBtn: { padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', cursor: 'pointer', fontSize: '14px', fontWeight: '500', fontFamily: 'inherit', transition: 'all 0.2s ease' },
  resultCount: { fontSize: '15px', fontWeight: '600', color: '#1a1a1a', marginBottom: '16px' },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', marginBottom: '40px' },
  emptyState: { textAlign: 'center', padding: '60px 24px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px dashed #d1d5db' },
  emptyIcon: { fontSize: '40px', marginBottom: '16px' },
  emptyTitle: { fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 8px 0' },
  emptySubtext: { fontSize: '14px', color: '#9ca3af', margin: 0 },
  cardWrapper: { transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)', borderRadius: '14px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' },
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