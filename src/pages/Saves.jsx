import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'
import Footer from '../components/Footer'

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
  const [collections, setCollections] = useState([])
  const [showNewCollection, setShowNewCollection] = useState(false)
  const [newCollectionName, setNewCollectionName] = useState('')
  const [selectedCollection, setSelectedCollection] = useState('all')
  const [opportunityToMove, setOpportunityToMove] = useState(null)
  const [showMoveModal, setShowMoveModal] = useState(false)
  const [dueSoon, setDueSoon] = useState([])
  const [dismissedBanner, setDismissedBanner] = useState(false)
  useEffect(() => {
  if (user) {
    fetchSavedOpportunities()
    fetchCollections()
  }
}, [user])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        setExpandedNotes(null)
        setShowMoveModal(false)
        setOpportunityToMove(null)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

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

    const { data: collectionMappings } = await supabase
      .from('opportunity_collections')
      .select('opportunity_id, collection_id')
      .eq('user_id', user.id)

    const opportunitiesWithCollections = (opportunities || []).map(opp => ({
      ...opp,
      collection_ids: collectionMappings
        ?.filter(m => m.opportunity_id === opp.id)
        .map(m => m.collection_id) || []
    }))

    const today = new Date()
    const soon = opportunitiesWithCollections.filter(op => {
      if (!op.deadline) return false
      const days = Math.ceil((new Date(op.deadline) - today) / (1000 * 60 * 60 * 24))
      return days >= 0 && days <= 7
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
    setDueSoon(soon)
    setSavedOpportunities(opportunitiesWithCollections)    
    await fetchMetadata()
    setLoading(false)
  }

  async function toggleSave(opportunityId) {
    await supabase.from('saves').delete().eq('user_id', user.id).eq('opportunity_id', opportunityId)
    setSavedOpportunities(savedOpportunities.filter(op => op.id !== opportunityId))
  }

  async function logView(opportunityId) {
    await supabase.from('opportunity_views').insert({ user_id: user.id, opportunity_id: opportunityId })
  }

  function getDeadlineStatus(deadline) {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const daysUntil = Math.floor((deadlineDate - today) / (1000 * 60 * 60 * 24))
    if (daysUntil < 0) return { status: 'closed', color: '#94a3b8', label: 'Closed' }
    if (daysUntil <= 7) return { status: 'urgent', color: '#ef4444', label: `${daysUntil}d left` }
    if (daysUntil <= 30) return { status: 'soon', color: '#f59e0b', label: `${daysUntil}d left` }
    return { status: 'normal', color: '#10b981', label: `${daysUntil}d left` }
  }

  function toggleSelectOpportunity(opId) {
    const newSelected = new Set(selectedOpportunities)
    if (newSelected.has(opId)) newSelected.delete(opId)
    else newSelected.add(opId)
    setSelectedOpportunities(newSelected)
  }

  function toggleSelectAll() {
    if (selectedOpportunities.size === filteredAndSorted.length) setSelectedOpportunities(new Set())
    else setSelectedOpportunities(new Set(filteredAndSorted.map(op => op.id)))
  }

  async function bulkDelete() {
    for (const opId of selectedOpportunities) {
      await supabase.from('saves').delete().eq('user_id', user.id).eq('opportunity_id', opId)
    }
    setSavedOpportunities(savedOpportunities.filter(op => !selectedOpportunities.has(op.id)))
    setSelectedOpportunities(new Set())
    setShowDeleteConfirm(false)
  }

  function clearFilters() {
  setSearchQuery('')
  setSelectedType('all')
  setSortBy('deadline')
}

function exportCSV() {
  if (filteredAndSorted.length === 0) return
  const headers = ['Title', 'Organization', 'Type', 'Deadline', 'Amount', 'Status', 'Notes']
  const rows = filteredAndSorted.map(op => {
    const meta = metadata[op.id] || {}
    return [
      `"${op.title || ''}"`,
      `"${op.org_name || ''}"`,
      op.type || '',
      op.deadline ? new Date(op.deadline).toLocaleDateString('en-CA') : 'N/A',
      op.amount ? `$${op.amount}` : 'N/A',
      meta.application_status || 'none',
      `"${(meta.notes || '').replace(/"/g, "'")}"`,
    ]
  })
  const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'verto-saves.csv'
  a.click()
  URL.revokeObjectURL(url)
}

  async function fetchMetadata() {
    const { data } = await supabase.from('save_metadata').select('*').eq('user_id', user.id)
    const metadataMap = {}
    data?.forEach(m => { metadataMap[m.opportunity_id] = m })
    setMetadata(metadataMap)
  }

  async function fetchCollections() {
    const { data } = await supabase.from('collections').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
    setCollections(data || [])
  }

  async function createCollection() {
    if (!newCollectionName.trim()) return
    const { data, error } = await supabase.from('collections').insert({ user_id: user.id, name: newCollectionName }).select()
    if (!error) {
      setCollections([...collections, data[0]])
      setNewCollectionName('')
      setShowNewCollection(false)
    }
  }

  async function moveToCollection(opportunityId, collectionId) {
    if (!collectionId) return
    const { error } = await supabase.from('opportunity_collections').insert({ user_id: user.id, opportunity_id: opportunityId, collection_id: collectionId })
    if (!error) {
      setSavedOpportunities(savedOpportunities.map(op =>
        op.id === opportunityId
          ? { ...op, collection_ids: [...(op.collection_ids || []), collectionId] }
          : op
      ))
    }
  }

  async function deleteCollection(collectionId) {
    await supabase.from('opportunity_collections').delete().eq('collection_id', collectionId)
    await supabase.from('collections').delete().eq('id', collectionId)
    setCollections(collections.filter(c => c.id !== collectionId))
    if (selectedCollection === collectionId) setSelectedCollection('all')
  }

  async function removeFromAllCollections(opportunityId) {
    await supabase.from('opportunity_collections').delete().eq('opportunity_id', opportunityId).eq('user_id', user.id)
    setSavedOpportunities(savedOpportunities.map(op =>
      op.id === opportunityId ? { ...op, collection_ids: [] } : op
    ))
  }

  async function updateNote(opportunityId, note) {
    const existing = metadata[opportunityId]
    if (existing) {
      await supabase.from('save_metadata').update({ notes: note }).eq('id', existing.id)
    } else {
      await supabase.from('save_metadata').insert({ user_id: user.id, opportunity_id: opportunityId, notes: note })
    }
    setMetadata({ ...metadata, [opportunityId]: { ...(metadata[opportunityId] || {}), notes: note } })
  }

  function fireConfetti() {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * -200,
      r: Math.random() * 8 + 4,
      d: Math.random() * 120 + 60,
      color: ['#064e3b','#34d399','#fbbf24','#3b82f6','#a78bfa','#f472b6'][Math.floor(Math.random() * 6)],
      tilt: Math.random() * 10 - 10,
      tiltSpeed: Math.random() * 0.1 + 0.05,
      speed: Math.random() * 3 + 2,
      opacity: 1,
    }))

    let frame = 0
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => {
        ctx.beginPath()
        ctx.lineWidth = p.r
        ctx.strokeStyle = p.color
        ctx.globalAlpha = p.opacity
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y)
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4)
        ctx.stroke()
        p.y += p.speed
        p.tilt += p.tiltSpeed
        p.opacity -= 0.008
      })
      frame++
      if (frame < 180) requestAnimationFrame(draw)
      else { canvas.remove() }
    }
    draw()
  }

  async function updateApplicationStatus(opportunityId, status) {    const existing = metadata[opportunityId]
    if (existing) {
      await supabase.from('save_metadata').update({ application_status: status, status_updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('save_metadata').insert({ user_id: user.id, opportunity_id: opportunityId, application_status: status, status_updated_at: new Date().toISOString() })
    }
    setMetadata({ ...metadata, [opportunityId]: { ...(metadata[opportunityId] || {}), application_status: status } })
  }

  async function toggleArchive(opportunityId) {
    const existing = metadata[opportunityId]
    const newStatus = !existing?.is_archived
    if (existing) {
      await supabase.from('save_metadata').update({ is_archived: newStatus }).eq('id', existing.id)
    } else {
      await supabase.from('save_metadata').insert({ user_id: user.id, opportunity_id: opportunityId, is_archived: newStatus })
    }
    setMetadata({ ...metadata, [opportunityId]: { ...(metadata[opportunityId] || {}), is_archived: newStatus } })
  }

  const getUniqueTypes = () => Array.from(new Set(savedOpportunities.map(op => op.type))).sort()

  const filteredAndSorted = savedOpportunities
    .filter(op => {
      const matchesSearch =
        op.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        op.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesType = selectedType === 'all' || op.type === selectedType
      const isArchived = metadata[op.id]?.is_archived || false
      const shouldShow = showArchived ? isArchived : !isArchived
      const matchesCollection = selectedCollection === 'all' || (op.collection_ids && op.collection_ids.includes(selectedCollection))
      return matchesSearch && matchesType && shouldShow && matchesCollection
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') return new Date(a.deadline) - new Date(b.deadline)
      if (sortBy === 'newest') return new Date(b.created_at) - new Date(a.created_at)
      return 0
    })

  const statusConfig = {
    applied:   { label: 'Applied',   icon: '✓', activeColor: '#3b82f6', activeBg: '#eff6ff' },
    interview: { label: 'Interview', icon: '📞', activeColor: '#8b5cf6', activeBg: '#f5f3ff' },
    rejected:  { label: 'Rejected',  icon: '✕', activeColor: '#ef4444', activeBg: '#fef2f2' },
    accepted:  { label: 'Accepted',  icon: '🎉', activeColor: '#10b981', activeBg: '#f0fdf4' },
  }

  if (loading) return (
    <div style={S.loadingScreen}>
      <div style={S.loadingDot} />
      <span style={S.loadingText}>Loading your saves...</span>
    </div>
  )

  return (
    <div style={S.page}>
      {/* Header */}
      <div style={S.header}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <Logo />
          <p style={S.subtitle}>
            {savedOpportunities.length} saved opportunity{savedOpportunities.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={S.headerActions}>
          <button style={S.btnOutline} onClick={() => navigate('/dashboard')}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#064e3b'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = '#064e3b' }}>
            ← Dashboard
          </button>
            <button
              onClick={exportCSV}
              style={{ padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
              ↓ Export CSV
            </button>
            <button style={S.btnGhost} onClick={signOut}            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
            Sign out
          </button>
        </div>
      </div>

        {dueSoon.length > 0 && !dismissedBanner && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', backgroundColor: '#fffbeb', border: '1.5px solid #fde68a', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
              <span style={{ fontSize: '20px', flexShrink: 0 }}>⏰</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#92400e', margin: '0 0 8px 0' }}>
                  {dueSoon.length} saved opportunit{dueSoon.length !== 1 ? 'ies are' : 'y is'} closing within 7 days
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {dueSoon.map(op => {
                    const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    return (
                      <span key={op.id} style={{ fontSize: '13px', color: '#78350f' }}>
                        <span style={{ fontWeight: '700', color: days <= 2 ? '#dc2626' : '#d97706' }}>
                          {days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}
                        </span>
                        {' — '}{op.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
            <button onClick={() => setDismissedBanner(true)} style={{ background: 'none', border: 'none', color: '#d97706', fontSize: '18px', cursor: 'pointer', padding: 0, fontWeight: '700', flexShrink: 0 }}>✕</button>
          </div>
        )}

        {savedOpportunities.length === 0 ? (
        <div style={S.emptyState}>
          <div style={S.emptyIcon}>★</div>
          <h3 style={S.emptyTitle}>Nothing saved yet</h3>
          <p style={S.emptyBody}>When you find opportunities you like, save them here.</p>
          <button style={S.btnPrimary} onClick={() => navigate('/dashboard')}>Browse opportunities</button>
        </div>
      ) : (
        <>
          {/* Controls panel */}
          <div style={S.controlsPanel}>

            {/* Collections row */}
            <div style={S.controlRow}>
              <span style={S.controlLabel}>Collections</span>
              <div style={S.pillRow}>
                <button
                  style={{ ...S.pill, ...(selectedCollection === 'all' ? S.pillActive : {}) }}
                  onClick={() => setSelectedCollection('all')}>
                  All
                </button>
                {collections.map(c => (
                  <div key={c.id} style={S.pillWithDelete}>
                    <button
                      style={{ ...S.pill, ...(selectedCollection === c.id ? S.pillActive : {}) }}
                      onClick={() => setSelectedCollection(c.id)}>
                      {c.name}
                    </button>
                    <button style={S.pillDelete} onClick={() => deleteCollection(c.id)} title="Delete collection">✕</button>
                  </div>
                ))}
                {showNewCollection ? (
                  <div style={S.inlineForm}>
                    <input
                      autoFocus
                      type="text"
                      placeholder="Name..."
                      value={newCollectionName}
                      onChange={e => setNewCollectionName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && createCollection()}
                      style={S.inlineInput}
                    />
                    <button style={S.btnSmallPrimary} onClick={createCollection}>Save</button>
                    <button style={S.btnSmallGhost} onClick={() => { setShowNewCollection(false); setNewCollectionName('') }}>Cancel</button>
                  </div>
                ) : (
                  <button style={S.newCollectionBtn} onClick={() => setShowNewCollection(true)}>+ New</button>
                )}
              </div>
            </div>

            {/* Divider */}
            <div style={S.divider} />

            {/* Filters row */}
            <div style={S.controlRow}>
              <span style={S.controlLabel}>Filter</span>
              <div style={S.pillRow}>
                <button style={{ ...S.pill, ...(selectedType === 'all' ? S.pillActive : {}) }} onClick={() => setSelectedType('all')}>All types</button>
                {getUniqueTypes().map(type => (
                  <button key={type} style={{ ...S.pill, ...(selectedType === type ? S.pillActive : {}) }} onClick={() => setSelectedType(type)}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort + View row */}
            <div style={S.controlRow}>
              <span style={S.controlLabel}>Sort</span>
              <div style={S.pillRow}>
                <button style={{ ...S.pill, ...(sortBy === 'deadline' ? S.pillActive : {}) }} onClick={() => setSortBy('deadline')}>Earliest deadline</button>
                <button style={{ ...S.pill, ...(sortBy === 'newest' ? S.pillActive : {}) }} onClick={() => setSortBy('newest')}>Newest first</button>
                <div style={{ width: '1px', height: '20px', backgroundColor: '#e5e7eb', margin: '0 4px' }} />
                <button style={{ ...S.pill, ...(showArchived ? S.pillActive : {}) }} onClick={() => setShowArchived(!showArchived)}>
                  {showArchived ? '📦 Archived' : 'Active'}
                </button>
              </div>
            </div>

            {/* Search row */}
            <div style={S.controlRow}>
              <span style={S.controlLabel}>Search</span>
              <div style={{ display: 'flex', gap: '8px', flex: 1 }}>
                <input
                  type="text"
                  placeholder="Search by title, org, or keyword..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={S.searchInput}
                />
                {(searchQuery || selectedType !== 'all' || sortBy !== 'deadline') && (
                  <button style={S.clearBtn} onClick={clearFilters}>Clear</button>
                )}
              </div>
            </div>
          </div>

          {/* Bulk action bar */}
          {selectedOpportunities.size > 0 && (
            <div style={S.bulkBar}>
              <label style={S.bulkLabel}>
                <input type="checkbox" checked={selectedOpportunities.size === filteredAndSorted.length} onChange={toggleSelectAll} style={{ accentColor: '#064e3b', cursor: 'pointer' }} />
                <span>{selectedOpportunities.size} selected</span>
              </label>
              {showDeleteConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#374151', fontWeight: '500' }}>Remove {selectedOpportunities.size} save{selectedOpportunities.size !== 1 ? 's' : ''}?</span>
                  <button style={S.btnDanger} onClick={bulkDelete}>Yes, remove</button>
                  <button style={S.btnSmallGhost} onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                </div>
              ) : (
                <button style={S.btnDanger} onClick={() => setShowDeleteConfirm(true)}>Remove selected</button>
              )}
            </div>
          )}

          {/* Results count */}
          <div style={S.resultsRow}>
            <span style={S.resultsCount}>
              {filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? 's' : ''}
            </span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#6b7280', cursor: 'pointer' }}>
              <input type="checkbox"
                checked={selectedOpportunities.size === filteredAndSorted.length && filteredAndSorted.length > 0}
                onChange={toggleSelectAll}
                style={{ accentColor: '#064e3b', cursor: 'pointer' }}
              />
              Select all
            </label>
          </div>

          {/* Cards */}
          {filteredAndSorted.length === 0 ? (
            <div style={S.noResults}>
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '15px' }}>No results. Try adjusting your filters.</p>
            </div>
          ) : (
            <div style={S.grid}>
              {filteredAndSorted.map(op => {
                const status = getDeadlineStatus(op.deadline)
                const meta = metadata[op.id] || {}
                const isArchived = meta.is_archived
                const hasNote = meta.notes && meta.notes.trim().length > 0
                const appStatus = meta.application_status

                return (
                  <div key={op.id} style={{ ...S.card, opacity: isArchived ? 0.55 : 1 }}>

                    {/* Card top bar */}
                    <div style={S.cardTop}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <input
                          type="checkbox"
                          checked={selectedOpportunities.has(op.id)}
                          onChange={() => toggleSelectOpportunity(op.id)}
                          style={{ accentColor: '#064e3b', cursor: 'pointer', width: '15px', height: '15px' }}
                        />
                        <span style={{ ...S.deadlineBadge, backgroundColor: status.color + '18', color: status.color, borderColor: status.color + '30' }}>
                          {status.label}
                        </span>
                        {appStatus && (
                          <span style={{ ...S.statusBadge, backgroundColor: statusConfig[appStatus]?.activeBg, color: statusConfig[appStatus]?.activeColor }}>
                            {statusConfig[appStatus]?.icon} {statusConfig[appStatus]?.label}
                          </span>
                        )}
                        {isArchived && <span style={S.archivedBadge}>📦 Archived</span>}
                      </div>
                    </div>

                    {/* Opportunity card */}
                    <OpportunityCard
                      opportunity={op}
                      isSaved={true}
                      onToggleSave={toggleSave}
                      onLogView={logView}
                    />

                    {/* Action bar */}
                    <div style={S.actionBar}>
                      {/* Status timeline */}
                      <div style={S.timeline}>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <button
                            key={key}
                            title={cfg.label}
                            style={{
                              ...S.timelineBtn,
                              ...(appStatus === key ? { backgroundColor: cfg.activeBg, borderColor: cfg.activeColor, color: cfg.activeColor } : {})
                            }}
                              onClick={() => { updateApplicationStatus(op.id, key); if (key === 'accepted') fireConfetti() }}>
                            {cfg.icon}
                          </button>
                        ))}
                      </div>

                      {/* Utility buttons */}
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          title="Notes"
                          style={{ ...S.utilBtn, ...(hasNote ? { backgroundColor: '#fef9c3', borderColor: '#fde047' } : {}) }}
                          onClick={() => setExpandedNotes(expandedNotes === op.id ? null : op.id)}>
                          📝
                        </button>
                        <button
                          title="Move to collection"
                          style={{ ...S.utilBtn, ...(op.collection_ids?.length > 0 ? { backgroundColor: '#eff6ff', borderColor: '#bfdbfe' } : {}) }}
                          onClick={() => { setOpportunityToMove(op.id); setShowMoveModal(true) }}>
                          📂
                        </button>
                        <button
                          title={isArchived ? 'Unarchive' : 'Archive'}
                          style={{ ...S.utilBtn, ...(isArchived ? { backgroundColor: '#fef2f2', borderColor: '#fecaca' } : {}) }}
                          onClick={() => toggleArchive(op.id)}>
                          📦
                        </button>
                      </div>
                    </div>

                    {/* Move to collection panel */}
                    {showMoveModal && opportunityToMove === op.id && (
                      <div style={S.movePanel}>
                        <span style={S.movePanelLabel}>Move to collection</span>
                        <div style={S.movePillRow}>
                          <button style={S.movePillRemove} onClick={() => { removeFromAllCollections(op.id); setShowMoveModal(false); setOpportunityToMove(null) }}>
                            Remove from all
                          </button>
                          {collections.map(c => (
                            <button key={c.id} style={S.movePill} onClick={() => { moveToCollection(op.id, c.id); setShowMoveModal(false); setOpportunityToMove(null) }}>
                              {c.name}
                            </button>
                          ))}
                        </div>
                        <button style={S.moveCancelBtn} onClick={() => { setShowMoveModal(false); setOpportunityToMove(null) }}>Cancel</button>
                      </div>
                    )}

                    {/* Notes panel */}
                      {meta.notes && meta.notes.trim() && expandedNotes !== op.id && (
                        <div style={{ padding: '8px 14px', backgroundColor: '#fffdf0', borderTop: '1px solid #fde68a', fontSize: '12px', color: '#78350f', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}
                          onClick={() => setExpandedNotes(op.id)}>
                          📝 {meta.notes.trim()}
                        </div>
                      )}
                      {expandedNotes === op.id && (
                        <div style={S.notePanel}>
                          <textarea
                            placeholder="Add a private note about this opportunity..."
                            value={meta.notes || ''}
                            onChange={e => updateNote(op.id, e.target.value)}
                            style={S.noteInput}
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
      <Footer />
    </div>
  )
}

const S = {
  page: {
    maxWidth: '1140px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
  },
  loadingScreen: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: '#fafafa',
  },
  loadingDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#064e3b',
    animation: 'pulse 1.2s infinite',
  },
  loadingText: {
    fontSize: '14px',
    color: '#9ca3af',
    fontWeight: '500',
  },

  // Header
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '32px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#9ca3af',
    margin: '2px 0 0 0',
    fontWeight: '400',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },

  // Buttons
  btnOutline: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1.5px solid #064e3b',
    backgroundColor: 'transparent',
    color: '#064e3b',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  btnGhost: {
    padding: '8px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    padding: '11px 24px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  btnSmallPrimary: {
    padding: '6px 12px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  btnSmallGhost: {
    padding: '6px 12px',
    borderRadius: '7px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  btnDanger: {
    padding: '6px 12px',
    borderRadius: '7px',
    border: 'none',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },

  // Controls panel
  controlsPanel: {
    backgroundColor: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: '16px',
    padding: '20px 24px',
    marginBottom: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  controlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexWrap: 'wrap',
  },
  controlLabel: {
    fontSize: '11px',
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.6px',
    minWidth: '72px',
    flexShrink: 0,
  },
  divider: {
    height: '1px',
    backgroundColor: '#f3f4f6',
    margin: '2px 0',
  },
  pillRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  pill: {
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: '#fafafa',
    color: '#374151',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },
  pillActive: {
    backgroundColor: '#064e3b',
    borderColor: '#064e3b',
    color: '#fff',
  },
  pillWithDelete: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
  },
  pillDelete: {
    position: 'absolute',
    top: '-7px',
    right: '-7px',
    width: '16px',
    height: '16px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: '#ef4444',
    color: '#fff',
    fontSize: '9px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    lineHeight: 1,
    padding: 0,
  },
  newCollectionBtn: {
    padding: '5px 12px',
    borderRadius: '20px',
    border: '1.5px dashed #d1d5db',
    backgroundColor: 'transparent',
    color: '#9ca3af',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    transition: 'all 0.15s ease',
  },
  inlineForm: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
  },
  inlineInput: {
    padding: '5px 10px',
    borderRadius: '8px',
    border: '1.5px solid #d1d5db',
    fontSize: '12px',
    fontFamily: 'inherit',
    width: '140px',
    outline: 'none',
  },
  searchInput: {
    flex: 1,
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    backgroundColor: '#fafafa',
  },
  clearBtn: {
    padding: '8px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: 'transparent',
    color: '#6b7280',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
    whiteSpace: 'nowrap',
  },

  // Bulk bar
  bulkBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 16px',
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    borderRadius: '10px',
    marginBottom: '16px',
  },
  bulkLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#064e3b',
    cursor: 'pointer',
  },

  // Results row
  resultsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  resultsCount: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
  },

  // Grid
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '20px',
  },

  // Card
  card: {
    border: '1.5px solid #e5e7eb',
    borderRadius: '14px',
    overflow: 'hidden',
    backgroundColor: '#fff',
    transition: 'box-shadow 0.2s ease, transform 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    backgroundColor: '#fafafa',
    borderBottom: '1px solid #f3f4f6',
  },
  deadlineBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '700',
    border: '1px solid transparent',
  },
  statusBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
  },
  archivedBadge: {
    padding: '3px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
  },

  // Action bar
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    borderTop: '1px solid #f3f4f6',
    backgroundColor: '#fafafa',
    gap: '12px',
  },
  timeline: {
    display: 'flex',
    gap: '4px',
    padding: '4px',
    backgroundColor: '#fff',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
  },
  timelineBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1.5px solid transparent',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  utilBtn: {
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '6px',
    border: '1px solid #e5e7eb',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.2s ease',
  },
  notePanel: {
    padding: '12px',
    borderTop: '1px solid #f3f4f6',
    backgroundColor: '#fffbeb',
  },
  noteInput: {
    width: '100%',
    minHeight: '80px',
    padding: '10px',
    borderRadius: '8px',
    border: '1px solid #fde68a',
    fontSize: '13px',
    fontFamily: 'inherit',
    outline: 'none',
    backgroundColor: 'transparent',
    resize: 'vertical',
  },
  movePanel: {
    padding: '12px',
    borderTop: '1px solid #f3f4f6',
    backgroundColor: '#f8fafc',
  },
  movePanelLabel: {
    display: 'block',
    fontSize: '11px',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: '8px',
  },
  movePillRow: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
    marginBottom: '10px',
  },
  movePill: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#fff',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  movePillRemove: {
    padding: '4px 10px',
    borderRadius: '6px',
    border: '1px solid #fecaca',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  moveCancelBtn: {
    fontSize: '12px',
    color: '#94a3b8',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    fontWeight: '500',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: '#fff',
    borderRadius: '24px',
    border: '2px dashed #e5e7eb',
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '16px',
  },
  emptyTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '8px',
  },
  emptyBody: {
    fontSize: '15px',
    color: '#6b7280',
    marginBottom: '24px',
  },
  noResults: {
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#f9fafb',
    borderRadius: '16px',
  }
}