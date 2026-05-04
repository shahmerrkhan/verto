import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function Analytics() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ views: 0, saves: 0, applications: 0 })
  const [topOpportunities, setTopOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [dueSoon, setDueSoon] = useState([])
  const [dismissedBanner, setDismissedBanner] = useState(false)
  const [appStatusBreakdown, setAppStatusBreakdown] = useState({})
  const [savesWithMeta, setSavesWithMeta] = useState([])

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

  async function fetchAnalytics() {
    const [viewsRes, savesRes, appsRes, metaRes] = await Promise.all([
      supabase.from('opportunity_views').select('*').eq('user_id', user.id),
      supabase.from('saves').select('opportunity_id').eq('user_id', user.id),
      supabase.from('applications').select('*').eq('user_id', user.id),
      supabase.from('save_metadata').select('*').eq('user_id', user.id),
    ])

    const views = viewsRes.data || []
    const saves = savesRes.data || []
    const apps = appsRes.data || []
    const meta = metaRes.data || []

    setStats({ views: views.length, saves: saves.length, applications: apps.length })

    const breakdown = {}
    meta.forEach(m => {
      if (m.application_status) {
        breakdown[m.application_status] = (breakdown[m.application_status] || 0) + 1
      }
    })
    setAppStatusBreakdown(breakdown)

    const viewCounts = {}
    views.forEach(v => { viewCounts[v.opportunity_id] = (viewCounts[v.opportunity_id] || 0) + 1 })
    const topIds = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)

    if (topIds.length > 0) {
      const { data: opps } = await supabase.from('opportunities').select('id, title, org_name, type').in('id', topIds)
      setTopOpportunities(opps?.map(op => ({ ...op, views: viewCounts[op.id] })) || [])
    }

    if (saves.length > 0) {
      const savedIds = saves.map(s => s.opportunity_id)
      const { data: savedOpps } = await supabase
        .from('opportunities')
        .select('id, title, org_name, deadline, amount')
        .in('id', savedIds)
        .eq('is_active', true)

      const today = new Date()
      const soon = (savedOpps || []).filter(op => {
        if (!op.deadline) return false
        const days = Math.ceil((new Date(op.deadline) - today) / (1000 * 60 * 60 * 24))
        return days >= 0 && days <= 7
      }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      setDueSoon(soon)
      setSavesWithMeta(savedOpps || [])
    }

    const activity = [
      ...views.slice(-3).map(v => ({ type: 'view', id: v.opportunity_id, date: v.created_at || new Date().toISOString() })),
      ...saves.slice(-3).map(s => ({ type: 'save', id: s.opportunity_id, date: s.created_at || new Date().toISOString() })),
      ...apps.slice(-3).map(a => ({ type: 'apply', id: a.opportunity_id, date: a.created_at || new Date().toISOString() })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

    setRecentActivity(activity)
    setLoading(false)
  }

  function exportCSV() {
    if (savesWithMeta.length === 0) return
    const headers = ['Title', 'Organization', 'Deadline', 'Amount']
    const rows = savesWithMeta.map(op => [
      `"${op.title || ''}"`,
      `"${op.org_name || ''}"`,
      op.deadline ? new Date(op.deadline).toLocaleDateString('en-CA') : 'N/A',
      op.amount ? `$${op.amount}` : 'N/A',
    ])
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'verto-saves.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const statCards = [
    { label: 'Opportunities viewed', value: stats.views, icon: '👁', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
    { label: 'Saved', value: stats.saves, icon: '★', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
    { label: 'Applied', value: stats.applications, icon: '✓', color: '#3fb950', bg: 'rgba(63,185,80,0.1)', border: 'rgba(63,185,80,0.2)' },
  ]

  const activityConfig = {
    view:  { label: 'Viewed an opportunity',     icon: '👁', color: '#818cf8', bg: 'rgba(99,102,241,0.1)' },
    save:  { label: 'Saved an opportunity',      icon: '★', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
    apply: { label: 'Applied to an opportunity', icon: '✓', color: '#3fb950', bg: 'rgba(63,185,80,0.1)' },
  }

  const statusConfig = {
    applied:   { label: 'Applied',   color: '#818cf8', bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.2)',  icon: '✓' },
    interview: { label: 'Interview', color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)', icon: '◎' },
    accepted:  { label: 'Accepted',  color: '#3fb950', bg: 'rgba(63,185,80,0.1)',   border: 'rgba(63,185,80,0.2)',   icon: '★' },
    rejected:  { label: 'Rejected',  color: '#f85149', bg: 'rgba(248,81,73,0.1)',   border: 'rgba(248,81,73,0.2)',   icon: '✕' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '13px', color: '#484f58' }}>Loading your analytics...</span>
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', margin: '0 0 6px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Your activity</h1>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Track what you've explored, saved, and applied to</p>
        </div>
        <button onClick={exportCSV} style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22', color: '#7d8590', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s ease' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#e6edf3'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7d8590'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
          ↓ Export CSV
        </button>
      </div>

      {/* Due soon banner */}
      {dueSoon.length > 0 && !dismissedBanner && (
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
            <span style={{ fontSize: '18px', flexShrink: 0 }}>⏰</span>
            <div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', margin: '0 0 8px 0' }}>
                {dueSoon.length} saved opportunit{dueSoon.length !== 1 ? 'ies are' : 'y is'} closing within 7 days
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {dueSoon.map(op => {
                  const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                  return (
                    <span key={op.id} style={{ fontSize: '12px', color: '#7d8590' }}>
                      <span style={{ fontWeight: '700', color: days <= 2 ? '#f85149' : '#f59e0b' }}>
                        {days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}
                      </span>
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

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: '12px', marginBottom: '24px' }}>
        {statCards.map(card => (
          <div key={card.label} style={{ backgroundColor: '#161b22', border: `1px solid ${card.border}`, borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0, backgroundColor: card.bg, color: card.color }}>
              {card.icon}
            </div>
            <div>
              <p style={{ fontSize: '28px', fontWeight: '800', color: '#e6edf3', margin: '0 0 2px', letterSpacing: '-1px', fontFamily: "'Syne', sans-serif" }}>{card.value}</p>
              <p style={{ fontSize: '12px', color: '#7d8590', margin: 0, fontWeight: '500' }}>{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Most viewed + Recent activity */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '16px', marginBottom: '16px' }}>

        {/* Most viewed */}
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Most viewed</h3>
          <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 20px' }}>Opportunities you keep coming back to</p>
          {topOpportunities.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '28px 20px', backgroundColor: 'rgba(255,255,255,0.02)', borderRadius: '10px', border: '1px dashed rgba(255,255,255,0.07)', textAlign: 'center' }}>
              <span style={{ fontSize: '24px', marginBottom: '10px' }}>📊</span>
              <p style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>No views yet</p>
              <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 16px', maxWidth: '200px', lineHeight: 1.5 }}>Browse opportunities on your dashboard to see your activity here</p>
              <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', backgroundColor: '#f59e0b', color: '#0d1117', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                Browse opportunities
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {topOpportunities.map(opp => {
                const maxV = Math.max(...topOpportunities.map(o => o.views))
                const pct = maxV > 0 ? (opp.views / maxV) * 100 : 0
                return (
                  <div key={opp.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' }}>{opp.title}</span>
                      <span style={{ fontSize: '11px', color: '#484f58', fontWeight: '600' }}>{opp.views} view{opp.views !== 1 ? 's' : ''}</span>
                    </div>
                    <div style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, borderRadius: '3px', backgroundColor: pct === 100 ? '#f59e0b' : '#484f58', transition: 'width 0.7s ease' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Recent activity</h3>
          <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 20px' }}>Your latest interactions</p>
          {recentActivity.length === 0 ? (
            <p style={{ color: '#484f58', fontSize: '13px', margin: 0 }}>No activity yet</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {recentActivity.map((item, i) => {
                const cfg = activityConfig[item.type]
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                    <div style={{ width: '34px', height: '34px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0, backgroundColor: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', margin: '0 0 2px' }}>{cfg.label}</p>
                      <p style={{ fontSize: '11px', color: '#484f58', margin: 0 }}>
                        {new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Application status breakdown */}
      {Object.keys(appStatusBreakdown).length > 0 && (
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Application tracker</h3>
          <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 20px' }}>Where your applications stand right now</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))', gap: '10px' }}>
            {Object.entries(statusConfig).map(([key, cfg]) => {
              const count = appStatusBreakdown[key] || 0
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', borderRadius: '10px', border: `1px solid ${cfg.border}`, backgroundColor: cfg.bg, gap: '4px' }}>
                  <span style={{ fontSize: '16px', marginBottom: '4px' }}>{cfg.icon}</span>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: cfg.color, letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>{count}</span>
                  <span style={{ fontSize: '11px', color: '#7d8590', fontWeight: '600' }}>{cfg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Progress funnel */}
      <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>Your progress</h3>
        <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 24px' }}>How you're moving through the pipeline</p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { value: stats.views, label: 'Viewed', sub: 'opportunities', color: '#818cf8', bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.2)' },
            null,
            { value: stats.saves, label: 'Saved', sub: `${stats.views > 0 ? Math.round((stats.saves / stats.views) * 100) : 0}% of viewed`, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
            null,
            { value: stats.applications, label: 'Applied', sub: `${stats.saves > 0 ? Math.round((stats.applications / stats.saves) * 100) : 0}% of saved`, color: '#3fb950', bg: 'rgba(63,185,80,0.1)', border: 'rgba(63,185,80,0.2)' },
          ].map((item, i) =>
            item === null ? (
              <span key={i} style={{ fontSize: '18px', color: '#484f58', fontWeight: '700' }}>→</span>
            ) : (
              <div key={i} style={{ backgroundColor: '#0d1117', border: `1px solid ${item.border}`, borderRadius: '12px', padding: '20px', textAlign: 'center', minWidth: '120px', flex: '1 1 120px', maxWidth: '200px' }}>
                <div style={{ fontSize: '32px', fontWeight: '800', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', backgroundColor: item.bg, color: item.color, fontFamily: "'Syne', sans-serif" }}>{item.value}</div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>{item.label}</p>
                <p style={{ fontSize: '11px', color: '#484f58', margin: 0 }}>{item.sub}</p>
              </div>
            )
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}