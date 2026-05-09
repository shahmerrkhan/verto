import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getOpportunities, getSaves, getApplications, saveOpportunity, unsaveOpportunity, trackApplication, logView, awardBadges } from '../lib/dbHelpers'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import { rankOpportunitiesWithAI } from '../lib/aiMatcher'
import FilterBar from '../components/FilterBar'
import Toast from '../components/Toast'
import SortBar from '../components/SortBar'
import RecommendedSection from '../components/RecommendedSection'
import ProfileCompletion from '../components/ProfileCompletion'
import Footer from '../components/Footer'
import OpportunityOfTheDay from '../components/OpportunityOfTheDay'
import YouMightHaveMissed from '../components/YouMightHaveMissed'
import confetti from 'canvas-confetti'
import { checkNewBadges, BADGE_DEFINITIONS, BadgeUnlockNotification } from '../components/Badges'
import { calculateMatchScore } from '../lib/opportunityMatcher'
import { searchOpportunities, rankSearchResults } from '../lib/fullTextSearch'
import { trackPageView, trackSearch } from '../lib/analytics'

const QUICK_FILTERS = [
  { label: '💰 High value', id: 'highValue', filter: (op) => (op.amount || 0) >= 5000 },
  { label: '⏰ Due this month', id: 'thisMonth', filter: (op) => {
    if (!op.deadline) return false
    const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 30 && days > 0
  }},
  { label: '⭐ No essay', id: 'noEssay', filter: (op) => !op.requires_essay },
  { label: '🆕 Just added', id: 'newlyAdded', filter: (op) => {
    if (!op.created_at) return false
    return Math.ceil((new Date() - new Date(op.created_at)) / (1000 * 60 * 60 * 24)) <= 7
  }},
]

const ITEMS_PER_PAGE = 12

export default function Dashboard() {
  const { user, profile } = useAuth()
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
  const [pendingBadge, setPendingBadge] = useState(null)

  useEffect(() => {
    trackPageView('/dashboard')
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
    const { data, error } = await getOpportunities()
    if (error) {
      console.error(error)
      setLoading(false)
      return
    }
    const ranked = (profile ? rankOpportunitiesWithAI(data, profile) : data).map(op => ({
      ...op,
      _matchScore: profile ? calculateMatchScore(op, profile) : null,
    }))
    setOpportunities(ranked)
    setLoading(false)
  }

  async function fetchSaves() {
    const { data } = await getSaves(user.id)
    setSaves(data?.map(s => s.opportunity_id) || [])
  }

  async function fetchApplications() {
    const { data } = await getApplications(user.id)
    setApplications(data?.map(a => a.opportunity_id) || [])
  }

  function applyFilters(opps) {
    setCurrentPage(1)
    let result = opps

    if (activeQuickFilter) {
      const qf = QUICK_FILTERS.find(f => f.id === activeQuickFilter)
      if (qf) result = result.filter(qf.filter)
    }

    if (filters.type !== 'all') result = result.filter(op => op.type === filters.type)

    if (filters.province && filters.province !== 'all') {
      result = result.filter(op => {
        const scope = op.province_scope || []
        return scope.includes('ALL') || scope.includes(filters.province)
      })
    }

    if (filters.minAmount) {
      result = result.filter(op => op.amount && op.amount >= filters.minAmount)
    }

    if (filters.search?.trim()) {
      trackSearch(filters.search)
      result = searchOpportunities(result, filters.search)
      result = rankSearchResults(result, filters.search)
    }

    setFilteredOpportunities(result)
  }

  function getDaysUntilDeadline(deadline) {
    if (!deadline) return null
    return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
  }

  function getDeadlineUrgency(days) {
    if (days === null) return 'normal'
    if (days < 0) return 'expired'
    if (days <= 3) return 'urgent'
    if (days <= 7) return 'soon'
    return 'normal'
  }

  function handleSort(opps) {
    let sorted = [...opps]
    if (sortBy === 'deadline-asc') sorted.sort((a, b) => (!a.deadline ? 1 : !b.deadline ? -1 : new Date(a.deadline) - new Date(b.deadline)))
    else if (sortBy === 'amount-desc') sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0))
    return sorted
  }

  async function toggleSave(opportunityId) {
    const isSaved = saves.includes(opportunityId)
    if (isSaved) {
      await unsaveOpportunity(user.id, opportunityId)
      setSaves(saves.filter(id => id !== opportunityId))
    } else {
      await saveOpportunity(user.id, opportunityId)
      const newSaves = [...saves, opportunityId]
      setSaves(newSaves)

      const hasConfettied = localStorage.getItem('verto-first-save')
      if (!hasConfettied) {
        localStorage.setItem('verto-first-save', 'true')
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f59e0b', '#fbbf24', '#3fb950', '#818cf8', '#e6edf3'] })
      }

      const newlyEarned = checkNewBadges({
        saveCount: newSaves.length,
        appCount: applications.length,
        hasAccepted: false,
        speedDemon: false,
        currentBadges: profile?.badges || [],
      })
      if (newlyEarned.length > 0) {
        awardBadges(user.id, profile?.badges || [], newlyEarned)
        setPendingBadge(newlyEarned[0])
      }
    }
  }

  async function trackApplicationHelper(opportunityId) {
    const { error } = await trackApplication(user.id, opportunityId)

    if (error) {
      setToast({ message: 'Failed to track application', type: 'error' })
      return
    }

    const newApps = [...applications, opportunityId]
    setApplications(newApps)
    setToast({ message: 'Application tracked!', type: 'success' })

    const newlyEarned = checkNewBadges({
      saveCount: saves.length,
      appCount: newApps.length,
      hasAccepted: false,
      speedDemon: false,
      currentBadges: profile?.badges || [],
    })
    if (newlyEarned.length > 0) {
      awardBadges(user.id, profile?.badges || [], newlyEarned)
      setPendingBadge(newlyEarned[0])
    }
  }

  async function handleLogView(opportunityId) {
    await logView(user.id, opportunityId)
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '13px', color: '#484f58', fontFamily: 'DM Sans, sans-serif' }}>Finding your opportunities...</span>
      </div>
    </div>
  )

  const totalPages = Math.ceil(filteredOpportunities.length / ITEMS_PER_PAGE)
  const paginatedOpps = handleSort(filteredOpportunities).slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: 'clamp(80px, 10vw, 100px) clamp(16px, 3vw, 24px) 80px' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', margin: '0 0 6px 0', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Your opportunities</h2>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Hey {profile?.full_name?.split(' ')[0] || 'there'}, here's what we found for you.</p>
        </div>
      </div>

      <ProfileCompletion profile={profile} />

      <OpportunityOfTheDay />

      {/* Quick filters */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', marginRight: '4px' }}>Quick</span>
        {QUICK_FILTERS.map(qf => (
          <button key={qf.id} onClick={() => setActiveQuickFilter(activeQuickFilter === qf.id ? null : qf.id)} style={{ padding: '6px 14px', borderRadius: '20px', border: '1px solid', borderColor: activeQuickFilter === qf.id ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: activeQuickFilter === qf.id ? 'rgba(245,158,11,0.1)' : 'transparent', color: activeQuickFilter === qf.id ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            {qf.label}
          </button>
        ))}
      </div>

      {opportunities.length > 0 && (
        <RecommendedSection opportunities={opportunities} topN={3} saves={saves} applications={applications} onToggleSave={toggleSave} onLogView={handleLogView} onTrackApplication={trackApplicationHelper} />
      )}

      <YouMightHaveMissed />

      <FilterBar onFilterChange={setFilters} opportunities={opportunities} />

      {filteredOpportunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#161b22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {opportunities.length === 0 ? (
            <>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>No opportunities yet</p>
              <p style={{ fontSize: '14px', color: '#484f58', marginBottom: '20px' }}>Complete your profile so we can match you to the right ones</p>
              <button onClick={() => navigate('/profile')} style={{ padding: '10px 20px', borderRadius: '8px', backgroundColor: '#f59e0b', color: '#0d1117', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Complete profile →</button>
            </>
          ) : (
            <>
              <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>No results found</p>
              <p style={{ fontSize: '14px', color: '#484f58' }}>Try a different search term or clear your filters</p>
            </>
          )}
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#7d8590', margin: 0 }}>{filteredOpportunities.length} result{filteredOpportunities.length !== 1 ? 's' : ''}</p>
            <SortBar onSortChange={setSortBy} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(280px, 100%), 1fr))', gap: '14px' }}>
            {paginatedOpps.map(op => (
              <OpportunityCard key={op.id} opportunity={op} isSaved={saves.includes(op.id)} isApplied={applications.includes(op.id)} onToggleSave={toggleSave} onLogView={handleLogView} onTrackApplication={trackApplicationHelper} deadlineUrgency={getDeadlineUrgency(getDaysUntilDeadline(op.deadline))} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '32px', flexWrap: 'wrap' }}>
              <button onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === 1}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: currentPage === 1 ? 'transparent' : '#161b22', color: currentPage === 1 ? '#484f58' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>← Prev</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                .reduce((acc, p, idx, arr) => { if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...'); acc.push(p); return acc }, [])
                .map((p, i) => p === '...'
                  ? <span key={`e-${i}`} style={{ color: '#484f58', fontSize: '13px', padding: '0 4px' }}>...</span>
                  : <button key={p} onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                      style={{ width: '34px', height: '34px', borderRadius: '8px', border: '1px solid', borderColor: currentPage === p ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: currentPage === p ? 'rgba(245,158,11,0.1)' : '#161b22', color: currentPage === p ? '#f59e0b' : '#e6edf3', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>{p}</button>
                )}
              <button onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }} disabled={currentPage === totalPages}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: currentPage === totalPages ? 'transparent' : '#161b22', color: currentPage === totalPages ? '#484f58' : '#e6edf3', fontSize: '12px', fontWeight: '600', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>Next →</button>
            </div>
          )}
        </>
      )}

      {pendingBadge && (
        <BadgeUnlockNotification
          badge={BADGE_DEFINITIONS.find(b => b.id === pendingBadge)}
          onDismiss={() => setPendingBadge(null)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <Footer />
    </div>
  )
}