import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

export default function Saves() {
  const { user, signOut } = useAuth()
  const [savedOpportunities, setSavedOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [sortBy, setSortBy] = useState('deadline')
  const [selectedOpportunities, setSelectedOpportunities] = useState(new Set())
  const [metadata, setMetadata] = useState({})
  const [expandedNotes, setExpandedNotes] = useState(null)
  const [showArchived, setShowArchived] = useState(false)
  const navigate = useNavigate()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)


  useEffect(() => {
    if (user) {
      fetchSavedOpportunities()
    }
  }, [user])

  async function fetchSavedOpportunities() {
    const { data: saves } = await supabase
      .from('saves')
      .select('opportunity_id')
      .eq('user_id', user.id)

    if (!saves || saves.length === 0) {
      setSavedOpportunities([])
      setLoading(false)
      return
    }

    const opportunityIds = saves.map(s => s.opportunity_id)
    const { data: opportunities } = await supabase
      .from('opportunities')
      .select('*')
      .in('id', opportunityIds)
      .eq('is_active', true)

    setSavedOpportunities(opportunities || [])
    await fetchMetadata()
    setLoading(false)
  }

  async function toggleSave(opportunityId) {
    await supabase
      .from('saves')
      .delete()
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)

    setSavedOpportunities(
      savedOpportunities.filter(op => op.id !== opportunityId)
    )
  }

  async function logView(opportunityId) {
    await supabase
      .from('opportunity_views')
      .insert({ user_id: user.id, opportunity_id: opportunityId })
  }

  function getDeadlineStatus(deadline) {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const daysUntil = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysUntil < 0) return { status: 'closed', color: '#666', label: 'Closed' }
    if (daysUntil <= 7) return { status: 'urgent', color: '#dc2626', label: `${daysUntil}d left` }
    if (daysUntil <= 30) return { status: 'soon', color: '#f59e0b', label: `${daysUntil}d left` }
    return { status: 'normal', color: '#64748b', label: `${daysUntil}d left` }
  }

  function toggleSelectOpportunity(opId) {
    const newSelected = new Set(selectedOpportunities)
    if (newSelected.has(opId)) {
      newSelected.delete(opId)
    } else {
      newSelected.add(opId)
    }
    setSelectedOpportunities(newSelected)
  }

  function toggleSelectAll() {
    if (selectedOpportunities.size === filteredAndSorted.length) {
      setSelectedOpportunities(new Set())
    } else {
      setSelectedOpportunities(new Set(filteredAndSorted.map(op => op.id)))
    }
  }

  async function bulkDelete() {
    for (const opId of selectedOpportunities) {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opId)
    }
    setSavedOpportunities(
      savedOpportunities.filter(op => !selectedOpportunities.has(op.id))
    )
    setSelectedOpportunities(new Set())
    setShowDeleteConfirm(false)
  }

  function clearFilters() {
    setSearchQuery('')
    setSelectedType('all')
    setSortBy('deadline')
  }
  async function fetchMetadata() {
    const { data } = await supabase
      .from('save_metadata')
      .select('*')
      .eq('user_id', user.id)

    const metadataMap = {}
    data?.forEach(m => {
      metadataMap[m.opportunity_id] = m
    })
    setMetadata(metadataMap)
  }

  async function updateNote(opportunityId, note) {
    const existing = metadata[opportunityId]
    
    if (existing) {
      await supabase
        .from('save_metadata')
        .update({ notes: note })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('save_metadata')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          notes: note
        })
    }

    setMetadata({
      ...metadata,
      [opportunityId]: { ...(metadata[opportunityId] || {}), notes: note }
    })
  }

  async function toggleApplied(opportunityId) {
    const existing = metadata[opportunityId]
    const newStatus = !existing?.is_applied

    if (existing) {
      await supabase
        .from('save_metadata')
        .update({ is_applied: newStatus })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('save_metadata')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          is_applied: newStatus
        })
    }

    setMetadata({
      ...metadata,
      [opportunityId]: { ...(metadata[opportunityId] || {}), is_applied: newStatus }
    })
  }

  async function toggleArchive(opportunityId) {
    const existing = metadata[opportunityId]
    const newStatus = !existing?.is_archived

    if (existing) {
      await supabase
        .from('save_metadata')
        .update({ is_archived: newStatus })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('save_metadata')
        .insert({
          user_id: user.id,
          opportunity_id: opportunityId,
          is_archived: newStatus
        })
    }

    setMetadata({
      ...metadata,
      [opportunityId]: { ...(metadata[opportunityId] || {}), is_archived: newStatus }
    })
  }

  const getUniqueTypes = () => {
    const types = new Set(savedOpportunities.map(op => op.type))
    return Array.from(types).sort()
  }

  const filteredAndSorted = savedOpportunities
    .filter(op => {
      const matchesSearch = op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || op.type === selectedType
      const isArchived = metadata[op.id]?.is_archived || false
      const shouldShow = showArchived ? isArchived : !isArchived
      return matchesSearch && matchesType && shouldShow
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline) - new Date(b.deadline)
      } else if (sortBy === 'newest') {
        return new Date(b.created_at) - new Date(a.created_at)
      }
      return 0
    })

  if (loading) return <div style={styles.loading}>Loading your saved opportunities...</div>

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>      
      <div style={styles.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <Logo />
          <p style={styles.greeting}>Your saved opportunities</p>
        </div>
        <div style={styles.headerButtons}>
          <button
            style={styles.dashboardBtn}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#064e3b'
              e.target.style.color = '#fff'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.color = '#064e3b'
            }}
          >
            ← Back to all
          </button>
          <button
            style={styles.signOutBtn}
            onClick={signOut}
            onMouseEnter={e => {
              e.target.style.backgroundColor = '#f3f4f6'
              e.target.style.borderColor = '#ccc'
              e.target.style.color = '#333'
            }}
            onMouseLeave={e => {
              e.target.style.backgroundColor = 'transparent'
              e.target.style.borderColor = '#e0e0e0'
              e.target.style.color = '#666'
            }}
          >
            Sign out
          </button>
        </div>
      </div>

      {savedOpportunities.length === 0 ? (
        <div style={styles.empty}>
          <p>You haven't saved any opportunities yet.</p>
          <button style={styles.exploreBtn} onClick={() => navigate('/dashboard')}>
            Explore opportunities
          </button>
        </div>
      ) : (
        <>
          <div style={styles.controlsContainer}>
            <input
              type="text"
              placeholder="Search your saves..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="all">All types</option>
              {getUniqueTypes().map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={styles.filterSelect}
            >
              <option value="deadline">Earliest deadline</option>
              <option value="newest">Newest first</option>
            </select>

            {(searchQuery || selectedType !== 'all' || sortBy !== 'deadline') && (
              <button
                style={styles.clearBtn}
                onClick={clearFilters}
                onMouseEnter={e => {
                  e.target.style.backgroundColor = '#f3f4f6'
                  e.target.style.borderColor = '#bbb'
                }}
                onMouseLeave={e => {
                  e.target.style.backgroundColor = 'transparent'
                  e.target.style.borderColor = '#e0e0e0'
                }}
              >
                Clear filters
              </button>
            )}

            <button
              style={{...styles.filterSelect, backgroundColor: showArchived ? '#e0e7ff' : '#fff'}}
              onClick={() => setShowArchived(!showArchived)}
            >
              {showArchived ? 'Showing archived' : 'Show archived'}
            </button>
          </div>

          {selectedOpportunities.size > 0 && (
            <div style={styles.bulkActionBar}>
              <div style={styles.bulkInfo}>
                <input
                  type="checkbox"
                  checked={selectedOpportunities.size === filteredAndSorted.length}
                  onChange={toggleSelectAll}
                  style={styles.checkbox}
                />
                <span>{selectedOpportunities.size} selected</span>
              </div>
              {showDeleteConfirm ? (
                <div style={styles.inlineConfirm}>
                  <span style={styles.confirmText}>Remove {selectedOpportunities.size} save{selectedOpportunities.size !== 1 ? 's' : ''}?</span>
                  <button
                    style={styles.confirmYes}
                    onClick={bulkDelete}
                    onMouseEnter={e => e.target.style.backgroundColor = '#b91c1c'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#dc2626'}
                  >
                    Yes, remove
                  </button>
                  <button
                    style={styles.confirmNo}
                    onClick={() => setShowDeleteConfirm(false)}
                    onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={e => e.target.style.backgroundColor = '#fff'}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  style={styles.deleteBtn}
                  onClick={() => setShowDeleteConfirm(true)}
                  onMouseEnter={e => e.target.style.backgroundColor = '#fecaca'}
                  onMouseLeave={e => e.target.style.backgroundColor = '#fee2e2'}
                >
                  Delete selected
                </button>
              )}
            </div>
          )}

          {filteredAndSorted.length === 0 ? (
            <div style={styles.empty}>
              <p>No opportunities match your search.</p>
            </div>
          ) : (
            <div style={styles.grid}>
              {filteredAndSorted.map(op => {
                const status = getDeadlineStatus(op.deadline)
                const meta = metadata[op.id] || {}
                const isApplied = meta.is_applied
                const isArchived = meta.is_archived
                const hasNote = meta.notes && meta.notes.trim().length > 0

                return (
                  <div key={op.id} style={{...styles.cardContainer, opacity: isArchived ? 0.6 : 1}}>
                    <div style={styles.cardHeader}>
                      <input
                        type="checkbox"
                        checked={selectedOpportunities.has(op.id)}
                        onChange={() => toggleSelectOpportunity(op.id)}
                        style={styles.checkbox}
                      />
                      <div style={styles.badgeGroup}>
                        <div style={{...styles.urgencyBadge, backgroundColor: status.color}}>
                          {status.label}
                        </div>
                        {isApplied && <div style={styles.appliedBadge}>✓ Applied</div>}
                        {isArchived && <div style={styles.archivedBadge}>📦 Archived</div>}
                      </div>
                    </div>

                    <OpportunityCard
                      opportunity={op}
                      isSaved={true}
                      onToggleSave={toggleSave}
                      onLogView={logView}
                    />

                    <div style={styles.cardActions}>
                      <button
                        style={{...styles.actionBtn, backgroundColor: isApplied ? '#dbeafe' : '#fff'}}
                        onClick={() => toggleApplied(op.id)}
                        title="Mark as applied"
                      >
                        ✓
                      </button>
                      <button
                        style={{...styles.actionBtn, backgroundColor: hasNote ? '#fef3c7' : '#fff'}}
                        onClick={() => setExpandedNotes(expandedNotes === op.id ? null : op.id)}
                        title="Add note"
                      >
                        📝
                      </button>
                      <button
                        style={{...styles.actionBtn, backgroundColor: isArchived ? '#fecaca' : '#fff'}}
                        onClick={() => toggleArchive(op.id)}
                        title="Archive"
                      >
                        📦
                      </button>
                    </div>

                    {expandedNotes === op.id && (
                      <div style={styles.noteEditor}>
                        <textarea
                          placeholder="Add a note..."
                          value={meta.notes || ''}
                          onChange={e => updateNote(op.id, e.target.value)}
                          style={styles.noteInput}
                        />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '40px',
  },
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
    gap: '12px',
  },
 dashboardBtn: {
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
inlineConfirm: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  confirmText: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#374151',
  },
  confirmYes: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#dc2626',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.15s ease',
  },
  confirmNo: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1.5px solid #e0e0e0',
    backgroundColor: '#fff',
    color: '#555',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    transition: 'all 0.15s ease',
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
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },
  appliedBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#dbeafe',
    color: '#0369a1',
    fontSize: '11px',
    fontWeight: '700',
    zIndex: 10,
  },
  archivedBadge: {
    position: 'absolute',
    bottom: '8px',
    left: '8px',
    padding: '4px 10px',
    borderRadius: '6px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    fontSize: '11px',
    fontWeight: '600',
    zIndex: 10,
  },
  cardActions: {
    display: 'flex',
    gap: '8px',
    padding: '10px',
    borderTop: '1px solid #e5e7eb',
    justifyContent: 'flex-end',
  },
  actionBtn: {
    padding: '6px 10px',
    borderRadius: '6px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  noteEditor: {
    padding: '12px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb',
  },
  noteInput: {
    width: '100%',
    padding: '10px',
    borderRadius: '6px',
    border: '1.5px solid #e0e0e0',
    fontSize: '13px',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '80px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '15px',
  },
  controlsContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '28px',
    flexWrap: 'wrap',
  },
  searchInput: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    flex: '1',
    minWidth: '200px',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  clearBtn: {
    padding: '10px 14px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#666',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  bulkActionBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    marginBottom: '20px',
    border: '1.5px solid #bfdbfe',
  },
  bulkInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#064e3b',
  },
  deleteBtn: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
  },
checkbox: {
    cursor: 'pointer',
    width: '18px',
    height: '18px',
    accentColor: '#064e3b',
    borderRadius: '4px',
  },
  cardContainer: {
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px',
    overflow: 'hidden',
    transition: 'all 0.2s ease',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #e5e7eb',
  },
  badgeGroup: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  urgencyBadge: {
    padding: '4px 10px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '11px',
    fontWeight: '600',
  },
  filterSelect: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    backgroundColor: '#fff',
    cursor: 'pointer',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#888',
    fontSize: '15px',
  },
exploreBtn: {
  marginTop: '20px',
  padding: '11px 24px',
  borderRadius: '10px',
  backgroundColor: '#064e3b',
  color: '#fff',
  fontSize: '14px',
  fontWeight: '600',
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},
}