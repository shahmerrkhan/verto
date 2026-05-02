import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import { rankOpportunitiesWithAI } from '../lib/aiMatcher'
import FilterBar from '../components/FilterBar'
import Toast from '../components/Toast'
import SortBar from '../components/SortBar'
import RecommendedSection from '../components/RecommendedSection'
import ProfileCompletion from '../components/ProfileCompletion'
import Footer from '../components/Footer'

const QUICK_FILTERS = [
  { label: '💰 High value', id: 'highValue', filter: (op) => (op.amount || 0) >= 5000 },
  { label: '⏰ Due this month', id: 'thisMonth', filter: (op) => {
    if (!op.deadline) return false
    const today = new Date()
    const deadline = new Date(op.deadline)
    const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
    return daysLeft <= 30 && daysLeft > 0
  }},
  { label: '⭐ No essay', id: 'noEssay', filter: (op) => !op.requires_essay },
  { label: '🆕 Just added', id: 'newlyAdded', filter: (op) => {
    if (!op.created_at) return false
    const today = new Date()
    const created = new Date(op.created_at)
    const daysOld = Math.ceil((today - created) / (1000 * 60 * 60 * 24))
    return daysOld <= 7
  }},
]

const styles = {
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#064e3b',
    marginBottom: '0px',
    letterSpacing: '-0.5px',
  },
  greeting: {
    color: '#666',
    fontSize: '15px',
  },
  headerButtons: {
  display: 'flex',
  gap: '8px',
  flexWrap: 'wrap',
},
  savesBtn: {
    padding: '9px 18px',
    borderRadius: '10px',
    border: '1.5px solid #064e3b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#064e3b',
    transition: 'all 0.2s ease',
  },
  signOutBtn: {
    padding: '9px 18px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s ease',
  },
  quickFiltersContainer: {
    marginBottom: '24px',
    backgroundColor: '#f9fafb',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
  },
  quickFiltersLabel: {
    fontSize: '12px',
    fontWeight: '700',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    margin: '0 0 12px 0',
  },
  quickFiltersRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  quickFilterBtn: {
    padding: '8px 14px',
    borderRadius: '20px',
    border: '1.5px solid #d1d5db',
    backgroundColor: '#fff',
    color: '#374151',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  quickFilterBtnActive: {
    backgroundColor: '#064e3b',
    borderColor: '#064e3b',
    color: '#fff',
  },
  profileBtn: {
    padding: '9px 18px',
    borderRadius: '10px',
    border: '1.5px solid #064e3b',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#064e3b',
    transition: 'all 0.2s ease',
  },
  emptyBtn: {
    marginTop: '16px',
    padding: '10px 20px',
    borderRadius: '10px',
    backgroundColor: '#064e3b',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  grid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))',
  gap: '16px',
},
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '15px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#888',
    fontSize: '15px',
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '8px',
  },
  resultCount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    userSelect: 'none',
    width: 'fit-content',
  },
  logoSvg: {
    transition: 'filter 0.3s ease',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
container: {
  maxWidth: '1200px',
  margin: '0 auto',
  padding: 'clamp(80px, 10vw, 96px) clamp(16px, 3vw, 24px) 80px',
},
header: {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  marginBottom: '40px',
  flexWrap: 'wrap',
  gap: '16px',
},
  dashboardTitle: { fontSize: '24px', fontWeight: '700', color: '#111', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
}

export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [saves, setSaves] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', type: 'all' })
  const [sortBy, setSortBy] = useState('relevance')
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [activeQuickFilter, setActiveQuickFilter] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 12
  useEffect(() => {
    if (profile) {
      fetchOpportunities()
      fetchSaves()
      fetchApplications()
    }
  }, [profile])

  useEffect(() => {
  applyFilters(opportunities)
}, [opportunities, filters, activeQuickFilter])

  async function fetchOpportunities() {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error(error)
      setLoading(false)
      return
    }

    const rankedOpportunities = profile
      ? rankOpportunitiesWithAI(data, profile)
      : data

    setOpportunities(rankedOpportunities)
    setLoading(false)
  }

  async function fetchSaves() {
    const { data } = await supabase
      .from('saves')
      .select('opportunity_id')
      .eq('user_id', user.id)
    setSaves(data ? data.map(s => s.opportunity_id) : [])
  }

  async function fetchApplications() {
    const { data } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('user_id', user.id)
    setApplications(data ? data.map(a => a.opportunity_id) : [])
  }

  function applyFilters(opps) {
  setCurrentPage(1)
  let result = opps

    if (activeQuickFilter) {
      const quickFilter = QUICK_FILTERS.find(f => f.id === activeQuickFilter)
      if (quickFilter) {
        result = result.filter(quickFilter.filter)
      }
    }

    if (filters.type !== 'all') {
      result = result.filter(op => op.type === filters.type)
    }

    if (filters.search.trim()) {
      const term = filters.search.toLowerCase()
      result = result.filter(op =>
        op.title.toLowerCase().includes(term) ||
        op.org_name.toLowerCase().includes(term) ||
        op.description.toLowerCase().includes(term)
      )
    }

    setFilteredOpportunities(result)
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
  }

  function getDaysUntilDeadline(deadline) {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const days = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    return days
  }

  function getDeadlineUrgency(days) {
    if (days < 0) return 'expired'
    if (days <= 3) return 'urgent'
    if (days <= 7) return 'soon'
    return 'normal'
  }

  function handleSort(opportunities) {
    let sorted = [...opportunities]

    if (sortBy === 'deadline-asc') {
      sorted.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
    } else if (sortBy === 'amount-desc') {
      sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0))
    }

    return sorted
  }

  async function toggleSave(opportunityId) {
    const isSaved = saves.includes(opportunityId)

    if (isSaved) {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
      setSaves(saves.filter(id => id !== opportunityId))
      setToast({ message: 'Removed from saved', type: 'success' })
    } else {
      await supabase
        .from('saves')
        .insert({ user_id: user.id, opportunity_id: opportunityId })
      setSaves([...saves, opportunityId])
      setToast({ message: 'Added to saved', type: 'success' })
    }
  }

  async function trackApplication(opportunityId) {
    const { data, error } = await supabase
      .from('applications')
      .insert([{
        user_id: user.id,
        opportunity_id: opportunityId
      }])
      .select()

    if (error) {
      console.error("SUPABASE ERROR:", error)
      setToast({ message: 'Failed to track application', type: 'error' })
    } else {
      setApplications([...applications, opportunityId])
      setToast({ message: 'Application tracked!', type: 'success' })
    }
  }

  async function logView(opportunityId) {
    await supabase
      .from('opportunity_views')
      .insert({ user_id: user.id, opportunity_id: opportunityId })
  }

  async function trackClick(opportunityId) {
    await supabase
      .from('opportunity_clicks')
      .insert({ user_id: user.id, opportunity_id: opportunityId })
  }

  if (loading) return <div style={styles.loading}>Finding your opportunities...</div>

  return (
    <div style={styles.container} className="container">
      <div style={styles.header} className="header">
        <div>
          <h2 style={styles.dashboardTitle}>Your opportunities</h2>
          <p style={styles.greeting}>
            Hey {profile?.full_name?.split(' ')[0] || 'there'}, here's what we found for you.
          </p>
        </div>
      </div>
      <ProfileCompletion profile={profile} />

      <div style={styles.quickFiltersContainer}>
        <p style={styles.quickFiltersLabel}>Quick filters:</p>
        <div style={styles.quickFiltersRow}>
          {QUICK_FILTERS.map(qf => (
            <button
              key={qf.id}
              style={{
                ...styles.quickFilterBtn,
                ...(activeQuickFilter === qf.id ? styles.quickFilterBtnActive : {}),
              }}
              onClick={() => {
                setActiveQuickFilter(activeQuickFilter === qf.id ? null : qf.id)
              }}
            >
              {qf.label}
            </button>
          ))}
        </div>
      </div>

      {opportunities.length > 0 && (
        <RecommendedSection
          opportunities={opportunities}
          topN={3}
          saves={saves}
          applications={applications}
          onToggleSave={toggleSave}
          onLogView={logView}
          onTrackApplication={trackApplication}
        />
      )}

      <FilterBar onFilterChange={handleFilterChange} opportunities={opportunities} />

      {filteredOpportunities.length === 0 ? (
        <div style={styles.empty}>
          {opportunities.length === 0 ? (
            <>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
                <circle cx="60" cy="60" r="48" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2" />
                <rect x="38" y="44" width="44" height="36" rx="6" fill="#fff" stroke="#6ee7b7" strokeWidth="1.5" />
                <rect x="44" y="52" width="20" height="3" rx="1.5" fill="#34d399" />
                <rect x="44" y="59" width="32" height="3" rx="1.5" fill="#d1fae5" />
                <rect x="44" y="66" width="26" height="3" rx="1.5" fill="#d1fae5" />
                <circle cx="78" cy="42" r="10" fill="#064e3b" />
                <path d="M74 42l3 3 5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <p style={styles.emptyTitle}>No opportunities yet</p>
              <p style={styles.emptySubtext}>Complete your profile so we can match you to the right ones</p>
              <button
                style={styles.emptyBtn}
                onClick={() => navigate('/profile')}
                onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
                onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
              >
                Complete profile →
              </button>
            </>
          ) : (
            <>
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
                <circle cx="60" cy="60" r="48" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2" />
                <circle cx="54" cy="54" r="18" fill="#fff" stroke="#d1d5db" strokeWidth="2" />
                <circle cx="54" cy="54" r="10" fill="#f3f4f6" />
                <line x1="67" y1="67" x2="80" y2="80" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" />
                <circle cx="54" cy="54" r="4" fill="#9ca3af" />
              </svg>
              <p style={styles.emptyTitle}>No results found</p>
              <p style={styles.emptySubtext}>Try a different search term or clear your filters</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <p style={styles.resultCount}>{filteredOpportunities.length} opportunity{filteredOpportunities.length !== 1 ? 's' : ''} found</p>
            <SortBar onSortChange={setSortBy} />
          </div>
          <div style={styles.grid} className="grid">
            {handleSort(filteredOpportunities).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE).map(op => (
              <OpportunityCard
                key={op.id}
                opportunity={op}
                isSaved={saves.includes(op.id)}
                isApplied={applications.includes(op.id)}
                onToggleSave={toggleSave}
                onLogView={logView}
                onTrackApplication={trackApplication}
                deadlineUrgency={getDeadlineUrgency(getDaysUntilDeadline(op.deadline))}
              />
            ))}
          </div>
          {Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '32px', flexWrap: 'wrap' }}>
              <button
                onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === 1 ? '#f9fafb' : '#fff', color: currentPage === 1 ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                ← Prev
              </button>
              {Array.from({ length: Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) }, (_, i) => i + 1)
                .filter(p => p === 1 || p === Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => {
                  if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) => p === '...'
                  ? <span key={`ellipsis-${i}`} style={{ color: '#9ca3af', fontSize: '13px', padding: '0 4px' }}>...</span>
                  : <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ width: '36px', height: '36px', borderRadius: '8px', border: '1.5px solid', borderColor: currentPage === p ? '#064e3b' : '#e5e7eb', backgroundColor: currentPage === p ? '#064e3b' : '#fff', color: currentPage === p ? '#fff' : '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                      {p}
                    </button>
                )}
              <button
                onClick={() => { setCurrentPage(p => Math.min(Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE), p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                disabled={currentPage === Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE)}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: currentPage === Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) ? '#f9fafb' : '#fff', color: currentPage === Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) ? '#d1d5db' : '#374151', fontSize: '13px', fontWeight: '600', cursor: currentPage === Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE) ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
                Next →
              </button>
            </div>
          )}
        </>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    <Footer />
    </div>
  )
  
}