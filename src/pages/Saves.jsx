import { useEffect, useState } from 'react'
import OutcomeModal from '../components/OutcomeModal'
import { useAuth } from '../context/AuthContext'
import { getSaves, getSaveMetadata, unsaveOpportunity, upsertSaveMetadata, getCollections, createCollection as dbCreateCollection, deleteCollection as dbDeleteCollection, addToCollection, removeFromAllCollections, getOpportunityCollections, logView, awardBadges } from '../lib/db'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import DeadlineCountdown from '../components/DeadlineCountdown'
import { checkNewBadges, BADGE_DEFINITIONS, BadgeUnlockNotification } from '../components/Badges'
import Toast from '../components/Toast'
import { useResponsive } from '../config/responsive'

export default function Saves() {
  const { isMobile } = useResponsive()
  const { user } = useAuth()
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
  const [pendingBadge, setPendingBadge] = useState(null)
  const [toast, setToast] = useState(null)
  const [outcomeModal, setOutcomeModal] = useState(null) // { opportunity, saveMetaId }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { if (user) { fetchSavedOpportunities(); fetchCollections() } }, [user])
  
  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { setExpandedNotes(null); setShowMoveModal(false); setOpportunityToMove(null) }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  async function fetchSavedOpportunities() {
    const [{ data: saves }, { data: collectionMappings }] = await Promise.all([
      getSaves(user.id),
      getOpportunityCollections(user.id)
    ])

    if (!saves || saves.length === 0) { setSavedOpportunities([]); setLoading(false); return }

   const ids = saves.map(s => s.opportunity_id)
    const oppsRes = await fetch('/api/opportunities')
    const oppsJson = await oppsRes.json()
    const opportunities = Array.isArray(oppsJson.data) ? oppsJson.data.filter(o => ids.includes(o.id)) : []
    
    const oppsWithCollections = (opportunities || []).map(opp => ({
      ...opp,
      collection_ids: collectionMappings?.filter(m => m.opportunity_id === opp.id).map(m => m.collection_id) || []
    }))

    const today = new Date()
    setDueSoon(oppsWithCollections.filter(op => {
      if (!op.deadline) return false
      const days = Math.ceil((new Date(op.deadline) - today) / (1000 * 60 * 60 * 24))
      return days >= 0 && days <= 7
    }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline)))

    setSavedOpportunities(oppsWithCollections)
    await fetchMetadata()
    setLoading(false)
  }

  async function toggleSave(id) {
  await unsaveOpportunity(user.id, id)
  setSavedOpportunities(prev => prev.filter(op => op.id !== id))
}
async function handleLogView(id) { 
  await logView(user.id, id) 
}
async function fetchMetadata() { 
  const { data } = await getSaveMetadata(user.id)
  const m = {}
  data?.forEach(d => { m[d.opportunity_id] = d })
  setMetadata(m) 
}
async function fetchCollections() { 
  const { data } = await getCollections(user.id)
  setCollections(data || []) 
}
  async function createCollection() {
    if (!newCollectionName.trim()) return
    const { data, error } = await dbCreateCollection(user.id, newCollectionName)
    if (!error && data) { setCollections([...collections, data]); setNewCollectionName(''); setShowNewCollection(false) }
  }

  async function deleteCollection(id) {
    await dbDeleteCollection(user.id, id)
    setCollections(collections.filter(c => c.id !== id))
    if (selectedCollection === id) setSelectedCollection('all')
  }

  async function awardBadgesInSaves(newBadgeIds) {
    const token = await window.Clerk?.session?.getToken()
    const profRes = await fetch(`/api/profile?userId=${user.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    const { data: prof } = await profRes.json()
    await awardBadges(user.id, prof?.badges || [], newBadgeIds)
    setPendingBadge(newBadgeIds[0])
  }

  async function moveToCollection(oppId, collId) {
    if (!collId) return
    const { error } = await addToCollection(user.id, oppId, collId)
    if (!error) setSavedOpportunities(prev => prev.map(op => op.id === oppId ? { ...op, collection_ids: [...(op.collection_ids || []), collId] } : op))
  }

  async function handleRemoveFromAllCollections(oppId) {
    await removeFromAllCollections(user.id, oppId)
    setSavedOpportunities(prev => prev.map(op => op.id === oppId ? { ...op, collection_ids: [] } : op))
  }

async function updateNote(oppId, note) {
  await upsertSaveMetadata(user.id, oppId, { notes: note })
  setMetadata({ ...metadata, [oppId]: { ...(metadata[oppId] || {}), notes: note } })
}

  async function updateApplicationStatus(oppId, status) {
  const statusUpdatedAt = new Date().toISOString()
  await upsertSaveMetadata(user.id, oppId, { application_status: status, status_updated_at: statusUpdatedAt })
  setMetadata({ ...metadata, [oppId]: { ...(metadata[oppId] || {}), application_status: status, status_updated_at: statusUpdatedAt } })

    if (status === 'accepted') {
      fireConfetti()
      const profRes = await fetch(`/api/profile?userId=${user.id}`)
      const prof = await profRes.json()
      const newlyEarned = checkNewBadges({
        saveCount: savedOpportunities.length,
        appCount: Object.values(metadata).filter(m => m.application_status).length + 1,
        hasAccepted: true,
        speedDemon: false,
        currentBadges: prof?.badges || [],
      })
      if (newlyEarned.length > 0) awardBadgesInSaves(newlyEarned)
    }
  }

  async function toggleArchive(oppId) {
    const existing = metadata[oppId]
    const newStatus = !existing?.is_archived
    await upsertSaveMetadata(user.id, oppId, { is_archived: newStatus })
    setMetadata({ ...metadata, [oppId]: { ...(metadata[oppId] || {}), is_archived: newStatus } })
  }

  async function bulkDelete() {
      for (const id of selectedOpportunities) await unsaveOpportunity(user.id, id)
      setSavedOpportunities(prev => prev.filter(op => !selectedOpportunities.has(op.id)))
      setSelectedOpportunities(new Set()); setShowDeleteConfirm(false)
    }
  function toggleSelectOpportunity(id) {
    const s = new Set(selectedOpportunities)
    if (s.has(id)) s.delete(id); else s.add(id)
    setSelectedOpportunities(s)
  }

  function toggleSelectAll() {
    if (selectedOpportunities.size === filteredAndSorted.length) setSelectedOpportunities(new Set())
    else setSelectedOpportunities(new Set(filteredAndSorted.map(op => op.id)))
  }

  function exportCSV() {
    if (filteredAndSorted.length === 0) return
    const headers = ['Title', 'Organization', 'Type', 'Deadline', 'Amount', 'Status', 'Notes']
    const rows = filteredAndSorted.map(op => {
      const meta = metadata[op.id] || {}
      return [`"${op.title || ''}"`, `"${op.org_name || ''}"`, op.type || '', op.deadline ? new Date(op.deadline).toLocaleDateString('en-CA') : 'N/A', op.amount ? `$${op.amount}` : 'N/A', meta.application_status || 'none', `"${(meta.notes || '').replace(/"/g, "'")}"`]
    })
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'verto-saves.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  function fireConfetti() {
    const canvas = document.createElement('canvas')
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9999'
    document.body.appendChild(canvas)
    const ctx = canvas.getContext('2d')
    canvas.width = window.innerWidth; canvas.height = window.innerHeight
    const pieces = Array.from({ length: 120 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * -200, r: Math.random() * 8 + 4, color: ['#f59e0b','#3fb950','#818cf8','#f85149','#c084fc'][Math.floor(Math.random() * 5)], tilt: Math.random() * 10 - 10, tiltSpeed: Math.random() * 0.1 + 0.05, speed: Math.random() * 3 + 2, opacity: 1 }))
    let frame = 0
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      pieces.forEach(p => { ctx.beginPath(); ctx.lineWidth = p.r; ctx.strokeStyle = p.color; ctx.globalAlpha = p.opacity; ctx.moveTo(p.x + p.tilt + p.r / 4, p.y); ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4); ctx.stroke(); p.y += p.speed; p.tilt += p.tiltSpeed; p.opacity -= 0.008 })
      frame++; if (frame < 180) requestAnimationFrame(draw); else canvas.remove()
    }
    draw()
  }

  const getUniqueTypes = () => Array.from(new Set(savedOpportunities.map(op => op.type))).sort()

  const filteredAndSorted = savedOpportunities
    .filter(op => {
      const matchesSearch = op.title.toLowerCase().includes(searchQuery.toLowerCase()) || op.description.toLowerCase().includes(searchQuery.toLowerCase())
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
    applied:   { label: 'Applied',   icon: '✓', color: '#6366f1', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.25)' },
    interview: { label: 'Interview', icon: '◎', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.25)' },
    rejected:  { label: 'Rejected',  icon: '✕', color: '#f85149', bg: 'rgba(248,81,73,0.1)', border: 'rgba(248,81,73,0.25)' },
    accepted:  { label: 'Accepted',  icon: '★', color: '#3fb950', bg: 'rgba(63,185,80,0.1)', border: 'rgba(63,185,80,0.25)' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '13px', color: '#484f58' }}>Loading your saves...</span>
    </div>
  )

  const pill = (active) => ({
    padding: '5px 12px', borderRadius: '20px', border: '1px solid',
    borderColor: active ? '#f59e0b' : 'rgba(255,255,255,0.08)',
    backgroundColor: active ? 'rgba(245,158,11,0.1)' : 'transparent',
    color: active ? '#f59e0b' : '#7d8590',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit', whiteSpace: 'nowrap',
  })

  return (
    <div style={{ maxWidth: '1140px', margin: '0 auto', padding: isMobile ? '80px 16px 60px' : '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Saved opportunities</h1>
          <p style={{ fontSize: '13px', color: '#7d8590', margin: 0 }}>{savedOpportunities.length} saved</p>
        </div>
        <button onClick={exportCSV} style={{ padding: '8px 16px', minHeight: isMobile ? '44px' : '36px', width: isMobile ? '100%' : 'auto', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', color: '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Deadline banner */}
      {dueSoon.length > 0 && !dismissedBanner && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>⏰</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', margin: '0 0 8px 0' }}>{dueSoon.length} saved opportunit{dueSoon.length !== 1 ? 'ies are' : 'y is'} closing within 7 days</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dueSoon.map(op => {
                  const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <span key={op.id} style={{ fontSize: '12px', color: '#7d8590' }}>
                      <span style={{ fontWeight: '700', color: days <= 2 ? '#f85149' : '#f59e0b' }}>{days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}</span>
                      {' — '}{op.title}
                    </span>
                  )
                })}
              </div>
            </div>
          </div>
          <button onClick={() => setDismissedBanner(true)} style={{ background: 'none', border: 'none', color: '#484f58', fontSize: '16px', cursor: 'pointer', padding: 0, flexShrink: 0 }}>✕</button>
        </div>
      )}

      {savedOpportunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#161b22', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: '32px', marginBottom: '16px' }}>◇</p>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>Nothing saved yet</h3>
          <p style={{ fontSize: '14px', color: '#484f58', marginBottom: '24px' }}>When you find opportunities you like, save them here.</p>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Browse opportunities</button>
        </div>
      ) : (
        <>
          {/* Controls panel */}
          <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '18px 20px', marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Collections */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '72px', paddingTop: '6px', flexShrink: 0 }}>Collections</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button style={pill(selectedCollection === 'all')} onClick={() => setSelectedCollection('all')}>All</button>
                {collections.map(c => (
                  <div key={c.id} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                    <button style={pill(selectedCollection === c.id)} onClick={() => setSelectedCollection(c.id)}>{c.name}</button>
                    <button onClick={() => deleteCollection(c.id)} style={{ position: 'absolute', top: '-6px', right: '-6px', width: '14px', height: '14px', borderRadius: '50%', border: 'none', backgroundColor: '#f85149', color: '#fff', fontSize: '8px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0 }}>✕</button>
                  </div>
                ))}
                {showNewCollection ? (
                  <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                    <input autoFocus type="text" placeholder="Name..." value={newCollectionName} onChange={e => setNewCollectionName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createCollection()}
                      style={{ padding: '5px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '12px', fontFamily: 'inherit', width: '120px', outline: 'none' }} />
                    <button onClick={createCollection} style={{ padding: '5px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                    <button onClick={() => { setShowNewCollection(false); setNewCollectionName('') }} style={{ padding: '5px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#7d8590', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setShowNewCollection(true)} style={{ padding: '5px 12px', borderRadius: '20px', border: '1px dashed rgba(255,255,255,0.12)', backgroundColor: 'transparent', color: '#484f58', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>+ New</button>
                )}
              </div>
            </div>

            <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)' }} />

            {/* Filters */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '72px', paddingTop: '6px', flexShrink: 0 }}>Filter</span>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                <button style={pill(selectedType === 'all')} onClick={() => setSelectedType('all')}>All types</button>
                {getUniqueTypes().map(type => <button key={type} style={pill(selectedType === type)} onClick={() => setSelectedType(type)}>{type.charAt(0).toUpperCase() + type.slice(1)}</button>)}
              </div>
            </div>

            {/* Sort */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '72px', flexShrink: 0 }}>Sort</span>
              <div style={{ display: 'flex', gap: '5px' }}>
                <button style={pill(sortBy === 'deadline')} onClick={() => setSortBy('deadline')}>Earliest deadline</button>
                <button style={pill(sortBy === 'newest')} onClick={() => setSortBy('newest')}>Newest first</button>
                <button style={pill(showArchived)} onClick={() => setShowArchived(!showArchived)}>{showArchived ? '📦 Archived' : 'Active'}</button>
              </div>
            </div>

            {/* Search */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', minWidth: '72px', flexShrink: 0 }}>Search</span>
              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                <input type="text" placeholder="Search by title, org, or keyword..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                  style={{ flex: 1, padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '12px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'} onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
                {(searchQuery || selectedType !== 'all' || sortBy !== 'deadline') && (
                  <button onClick={() => { setSearchQuery(''); setSelectedType('all'); setSortBy('deadline') }} style={{ padding: '7px 12px', borderRadius: '8px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>Clear</button>
                )}
              </div>
            </div>
          </div>

          {/* Bulk bar */}
          {selectedOpportunities.size > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', marginBottom: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '600', color: '#f59e0b', cursor: 'pointer' }}>
                <input type="checkbox" checked={selectedOpportunities.size === filteredAndSorted.length} onChange={toggleSelectAll} style={{ accentColor: '#f59e0b', cursor: 'pointer' }} />
                {selectedOpportunities.size} selected
              </label>
              {showDeleteConfirm ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '12px', color: '#e6edf3' }}>Remove {selectedOpportunities.size} save{selectedOpportunities.size !== 1 ? 's' : ''}?</span>
                  <button onClick={bulkDelete} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(248,81,73,0.1)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Yes, remove</button>
                  <button onClick={() => setShowDeleteConfirm(false)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                </div>
              ) : (
                <button onClick={() => setShowDeleteConfirm(true)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', backgroundColor: 'rgba(248,81,73,0.1)', color: '#f85149', fontSize: '12px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>Remove selected</button>
              )}
            </div>
          )}

          {/* Results row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '12px', fontWeight: '600', color: '#7d8590' }}>{filteredAndSorted.length} result{filteredAndSorted.length !== 1 ? 's' : ''}</span>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#484f58', cursor: 'pointer' }}>
              <input type="checkbox" checked={selectedOpportunities.size === filteredAndSorted.length && filteredAndSorted.length > 0} onChange={toggleSelectAll} style={{ accentColor: '#f59e0b', cursor: 'pointer' }} />
              Select all
            </label>
          </div>

          {filteredAndSorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#161b22', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p style={{ margin: 0, color: '#484f58', fontSize: '14px' }}>No results. Try adjusting your filters.</p>
            </div>
          ) : (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: isMobile ? '12px' : '16px' }}>
            {filteredAndSorted.map(op => {
                const meta = metadata[op.id] || {}
                const isArchived = meta.is_archived
                const hasNote = meta.notes && meta.notes.trim().length > 0
                const appStatus = meta.application_status

                return (
                  <div key={op.id} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', overflow: 'hidden', opacity: isArchived ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                    {/* Card top bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <input type="checkbox" checked={selectedOpportunities.has(op.id)} onChange={() => toggleSelectOpportunity(op.id)} style={{ accentColor: '#f59e0b', cursor: 'pointer' }} />
                      <DeadlineCountdown
                        deadline={op.deadline}
                        showToastOnDeadlineDay
                        onDeadlineToday={() => setToast({ message: `⏰ "${op.title}" is due today!`, type: 'error' })}
                      />
                      {appStatus && (
                        <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', backgroundColor: statusConfig[appStatus]?.bg, color: statusConfig[appStatus]?.color, border: `1px solid ${statusConfig[appStatus]?.border}` }}>
                          {statusConfig[appStatus]?.icon} {statusConfig[appStatus]?.label}
                        </span>
                      )}
                      {meta.outcome && (
                        <span style={{
                          padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '600',
                          backgroundColor: meta.outcome === 'won' ? 'rgba(63,185,80,0.1)' : meta.outcome === 'finalist' ? 'rgba(245,158,11,0.1)' : 'rgba(129,140,248,0.1)',
                          color: meta.outcome === 'won' ? '#3fb950' : meta.outcome === 'finalist' ? '#f59e0b' : '#818cf8',
                          border: `1px solid ${meta.outcome === 'won' ? 'rgba(63,185,80,0.2)' : meta.outcome === 'finalist' ? 'rgba(245,158,11,0.2)' : 'rgba(129,140,248,0.2)'}`,
                        }}>
                          {meta.outcome === 'won' ? '🏆 Won' : meta.outcome === 'finalist' ? '🥈 Finalist' : meta.outcome === 'rejected' ? '❌ Rejected' : meta.outcome === 'waitlisted' ? '⏳ Waitlisted' : meta.outcome === 'withdrawn' ? '↩️ Withdrew' : '⏸️ Pending'}
                        </span>
                      )}
                      {isArchived && <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '600', backgroundColor: 'rgba(248,81,73,0.1)', color: '#f85149' }}>📦 Archived</span>}
                    </div>

                    <OpportunityCard opportunity={op} isSaved={true} onToggleSave={toggleSave} onLogView={handleLogView} />

                    {/* Action bar */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)', gap: '8px' }}>
                      <div style={{ display: 'flex', gap: '3px', padding: '3px', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                        {Object.entries(statusConfig).map(([key, cfg]) => (
                          <button key={key} title={cfg.label} onClick={() => { updateApplicationStatus(op.id, key); if (key === 'accepted') fireConfetti() }}
                            style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: `1.5px solid ${appStatus === key ? cfg.border : 'transparent'}`, backgroundColor: appStatus === key ? cfg.bg : 'transparent', cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s', color: appStatus === key ? cfg.color : '#484f58' }}>
                            {cfg.icon}
                          </button>
                        ))}
                      </div>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        {[
                          { title: 'Notes', icon: '📝', onClick: () => setExpandedNotes(expandedNotes === op.id ? null : op.id), active: hasNote, activeBg: 'rgba(245,158,11,0.1)', activeBorder: 'rgba(245,158,11,0.2)' },
                          { title: 'Move to collection', icon: '📂', onClick: () => { setOpportunityToMove(op.id); setShowMoveModal(true) }, active: op.collection_ids?.length > 0, activeBg: 'rgba(99,102,241,0.1)', activeBorder: 'rgba(99,102,241,0.2)' },
                          { title: isArchived ? 'Unarchive' : 'Archive', icon: '📦', onClick: () => toggleArchive(op.id), active: isArchived, activeBg: 'rgba(248,81,73,0.1)', activeBorder: 'rgba(248,81,73,0.2)' },
                          { title: 'Log outcome', icon: meta.outcome ? '🏆' : '🎯', onClick: () => setOutcomeModal({ opportunity: op, saveMetaId: meta.id }), active: !!meta.outcome, activeBg: meta.outcome === 'won' || meta.outcome === 'finalist' ? 'rgba(63,185,80,0.1)' : 'rgba(129,140,248,0.1)', activeBorder: meta.outcome === 'won' || meta.outcome === 'finalist' ? 'rgba(63,185,80,0.2)' : 'rgba(129,140,248,0.2)' },
                        ].map(btn => (
                          <button key={btn.title} title={btn.title} onClick={btn.onClick} style={{ width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', border: `1px solid ${btn.active ? btn.activeBorder : 'rgba(255,255,255,0.07)'}`, backgroundColor: btn.active ? btn.activeBg : 'rgba(255,255,255,0.03)', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' }}>
                            {btn.icon}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Move to collection panel */}
                    {showMoveModal && opportunityToMove === op.id && (
                      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <span style={{ display: 'block', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '8px' }}>Move to collection</span>
                        <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '8px' }}>
                          <button onClick={() => { handleRemoveFromAllCollections(op.id); setShowMoveModal(false); setOpportunityToMove(null) }} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(248,81,73,0.2)', backgroundColor: 'rgba(248,81,73,0.06)', color: '#f85149', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>Remove from all</button>
                          {collections.map(c => (
                            <button key={c.id} onClick={() => { moveToCollection(op.id, c.id); setShowMoveModal(false); setOpportunityToMove(null) }} style={{ padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.03)', color: '#e6edf3', fontSize: '11px', cursor: 'pointer', fontFamily: 'inherit' }}>{c.name}</button>
                          ))}
                        </div>
                        <button onClick={() => { setShowMoveModal(false); setOpportunityToMove(null) }} style={{ fontSize: '11px', color: '#484f58', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>Cancel</button>
                      </div>
                    )}

                    {/* Note preview */}
                    {meta.notes && meta.notes.trim() && expandedNotes !== op.id && (
                      <div onClick={() => setExpandedNotes(op.id)} style={{ padding: '8px 14px', backgroundColor: 'rgba(245,158,11,0.04)', borderTop: '1px solid rgba(245,158,11,0.1)', fontSize: '11px', color: '#7d8590', fontStyle: 'italic', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', cursor: 'pointer' }}>
                        📝 {meta.notes.trim()}
                      </div>
                    )}

                    {/* Note textarea */}
                    {expandedNotes === op.id && (
                      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.05)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
                        <textarea
                          autoFocus
                          placeholder="Add private notes about this opportunity..."
                          value={meta.notes || ''}
                          onChange={(e) => updateNote(op.id, e.target.value)}
                          style={{ width: '100%', minHeight: '80px', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '12px', fontFamily: 'inherit', outline: 'none', resize: 'vertical' }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                          <button onClick={() => setExpandedNotes(null)} style={{ padding: '4px 10px', borderRadius: '6px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '11px', fontWeight: '700', cursor: 'pointer' }}>Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
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
        {outcomeModal && (
          <OutcomeModal
            opportunity={outcomeModal.opportunity}
            saveMetaId={outcomeModal.saveMetaId}
            userId={user.id}
            onClose={() => setOutcomeModal(null)}
            onSaved={(outcome) => {
              setMetadata(prev => ({
                ...prev,
                [outcomeModal.opportunity.id]: {
                  ...(prev[outcomeModal.opportunity.id] || {}),
                  outcome,
                }
              }))
              if (outcome === 'won' || outcome === 'finalist') fireConfetti()
              setToast({ message: outcome === 'won' ? '🏆 Win logged! Check the leaderboard.' : 'Outcome saved.', type: 'success' })
            }}
          />
        )}        
      <Footer />
    </div>
  )
}