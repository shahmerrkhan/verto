import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOpportunities, getSaves, getApplications, saveOpportunity, unsaveOpportunity, trackApplication, logView } from '../lib/db'
import { rankOpportunitiesWithAI } from '../lib/aiMatcher'
import { calculateMatchScore } from '../lib/opportunityMatcher'
import OpportunityCard from '../components/OpportunityCard'
import Toast from '../components/Toast'
import Footer from '../components/Footer'

const ITEMS_PER_PAGE = 12

const QUICK_FILTERS = [
  { label: '💰 High value', id: 'highValue', filter: op => (op.amount || 0) >= 5000 },
  { label: '⏰ Due this month', id: 'thisMonth', filter: op => {
    if (!op.deadline) return false
    const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return days <= 30 && days > 0
  }},
  { label: '✏️ No essay', id: 'noEssay', filter: op => !op.requires_essay },
  { label: '✨ Just added', id: 'newlyAdded', filter: op => {
    if (!op.created_at) return false
    return Math.ceil((new Date() - new Date(op.created_at)) / (1000 * 60 * 60 * 24)) <= 7
  }},
]

function getDaysUntil(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function getUrgency(days) {
  if (days === null) return 'none'
  if (days <= 3) return 'critical'
  if (days <= 7) return 'high'
  if (days <= 30) return 'medium'
  return 'low'
}

export default function Dashboard() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()

  const [opportunities, setOpportunities] = useState([])
  const [saves, setSaves] = useState([])
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [activeQuickFilter, setActiveQuickFilter] = useState(null)
  const [sortBy, setSortBy] = useState('relevance')
  const [currentPage, setCurrentPage] = useState(1)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      getOpportunities(),
      getSaves(user.id),
      getApplications(user.id),
    ]).then(([opps, savedIds, appliedIds]) => {
      const scored = opps.map(op => ({
        ...op,
        matchScore: profile ? calculateMatchScore(op, profile) : 0,
      }))
      const ranked = profile ? rankOpportunitiesWithAI(scored, profile) : scored
      setOpportunities(ranked)
      setSaves(savedIds)
      setApplications(appliedIds)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [user, profile])

  const filtered = useMemo(() => {
    let list = [...opportunities]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(op =>
        op.title?.toLowerCase().includes(q) ||
        op.org_name?.toLowerCase().includes(q) ||
        op.description?.toLowerCase().includes(q)
      )
    }

    if (typeFilter !== 'all') {
      list = list.filter(op => op.type === typeFilter)
    }

    if (activeQuickFilter) {
      const qf = QUICK_FILTERS.find(f => f.id === activeQuickFilter)
      if (qf) list = list.filter(qf.filter)
    }

    if (sortBy === 'deadline') {
      list = list.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
    } else if (sortBy === 'amount') {
      list = list.sort((a, b) => (b.amount || 0) - (a.amount || 0))
    } else if (sortBy === 'newest') {
      list = list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    return list
  }, [opportunities, search, typeFilter, activeQuickFilter, sortBy])

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  async function toggleSave(opportunityId) {
    if (!user) return
    const isSaved = saves.includes(opportunityId)
    setSaves(prev => isSaved ? prev.filter(id => id !== opportunityId) : [...prev, opportunityId])
    try {
      if (isSaved) {
        await unsaveOpportunity(user.id, opportunityId)
        setToast({ message: 'Removed from saves', type: 'info' })
      } else {
        await saveOpportunity(user.id, opportunityId)
        setToast({ message: 'Saved!', type: 'success' })
      }
    } catch {
      setSaves(prev => isSaved ? [...prev, opportunityId] : prev.filter(id => id !== opportunityId))
      setToast({ message: 'Something went wrong', type: 'error' })
    }
  }

  async function handleTrackApplication(opportunityId) {
    if (!user || applications.includes(opportunityId)) return
    setApplications(prev => [...prev, opportunityId])
    try {
      await trackApplication(user.id, opportunityId)
    } catch {
      setApplications(prev => prev.filter(id => id !== opportunityId))
    }
  }

  async function handleLogView(opportunityId) {
    if (!user) return
    try { await logView(user.id, opportunityId) } catch {}
  }

  const types = ['all', ...new Set(opportunities.map(op => op.type).filter(Boolean))]

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
    }}>
      <div style={{
        width: '28px', height: '28px',
        border: '2px solid var(--accent-violet-muted)',
        borderTopColor: 'var(--accent-violet)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      paddingTop: '80px',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px 80px' }}>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '32px', paddingTop: '16px' }}
        >
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            fontFamily: 'var(--font-display)',
            margin: '0 0 6px',
            letterSpacing: '-0.5px',
          }}>
            {profile?.full_name ? `Hey ${profile.full_name.split(' ')[0]} 👋` : 'Your opportunities'}
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>
            {filtered.length} opportunities matched to your profile
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          style={{ marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <input
            type="text"
            placeholder="Search opportunities..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            style={{
              width: '100%',
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-strong)',
              backgroundColor: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: '14px',
              fontFamily: 'var(--font-sans)',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color var(--transition)',
            }}
            onFocus={e => e.target.style.borderColor = 'var(--accent-violet-border)'}
            onBlur={e => e.target.style.borderColor = 'var(--border-strong)'}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {QUICK_FILTERS.map(qf => (
              <button
                key={qf.id}
                onClick={() => { setActiveQuickFilter(activeQuickFilter === qf.id ? null : qf.id); setCurrentPage(1) }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: activeQuickFilter === qf.id ? 'var(--accent-violet-border)' : 'var(--border-default)',
                  backgroundColor: activeQuickFilter === qf.id ? 'var(--accent-violet-muted)' : 'var(--bg-surface)',
                  color: activeQuickFilter === qf.id ? 'var(--accent-violet)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all var(--transition)',
                }}
              >
                {qf.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', flex: 1 }}>
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(type); setCurrentPage(1) }}
                  style={{
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid',
                    borderColor: typeFilter === type ? 'var(--accent-cyan-border)' : 'var(--border-default)',
                    backgroundColor: typeFilter === type ? 'var(--accent-cyan-muted)' : 'transparent',
                    color: typeFilter === type ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                    textTransform: 'capitalize',
                    transition: 'all var(--transition)',
                  }}
                >
                  {type}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setCurrentPage(1) }}
              style={{
                padding: '6px 12px',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-strong)',
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="relevance">Best match</option>
              <option value="deadline">Deadline</option>
              <option value="amount">Amount</option>
              <option value="newest">Newest</option>
            </select>
          </div>
        </motion.div>

        {paginated.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              textAlign: 'center',
              padding: '80px 24px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
            }}
          >
            {opportunities.length === 0 ? (
              <>
                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  No opportunities yet
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                  Complete your profile so we can match you to the right ones
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--accent-violet)',
                    color: 'white',
                    border: 'none',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Complete profile →
                </button>
              </>
            ) : (
              <>
                <p style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '8px' }}>
                  No results found
                </p>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                  Try a different search or clear your filters
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))',
                gap: '16px',
                marginBottom: '32px',
              }}
            >
              <AnimatePresence mode="popLayout">
                {paginated.map((op, i) => (
                  <motion.div
                    key={op.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.2, delay: i * 0.03, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <OpportunityCard
                      opportunity={op}
                      isSaved={saves.includes(op.id)}
                      isApplied={applications.includes(op.id)}
                      onToggleSave={toggleSave}
                      onLogView={handleLogView}
                      onTrackApplication={handleTrackApplication}
                      deadlineUrgency={getUrgency(getDaysUntil(op.deadline))}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: currentPage === 1 ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  ← Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
                    acc.push(p)
                    return acc
                  }, [])
                  .map((p, i) => p === '...'
                    ? <span key={`e-${i}`} style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '0 4px' }}>...</span>
                    : <button
                        key={p}
                        onClick={() => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                        style={{
                          width: '34px', height: '34px',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid',
                          borderColor: currentPage === p ? 'var(--accent-violet-border)' : 'var(--border-default)',
                          backgroundColor: currentPage === p ? 'var(--accent-violet-muted)' : 'var(--bg-surface)',
                          color: currentPage === p ? 'var(--accent-violet)' : 'var(--text-secondary)',
                          fontSize: '13px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-sans)',
                        }}
                      >
                        {p}
                      </button>
                  )}

                <button
                  onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-surface)',
                    color: currentPage === totalPages ? 'var(--text-muted)' : 'var(--text-primary)',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <Footer />
    </div>
  )
}