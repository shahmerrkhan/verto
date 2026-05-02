  import { useEffect, useState } from 'react'
  import { useNavigate } from 'react-router-dom'
  import { useAuth } from '../context/AuthContext'
  import { supabase } from '../lib/supabase'
  import Footer from '../components/Footer'
  

  export default function Analytics() {
    const { user, signOut } = useAuth()
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

      // App status breakdown
      const breakdown = {}
      meta.forEach(m => {
        if (m.application_status) {
          breakdown[m.application_status] = (breakdown[m.application_status] || 0) + 1
        }
      })
      setAppStatusBreakdown(breakdown)

      // Top viewed opportunities
      const viewCounts = {}
      views.forEach(v => { viewCounts[v.opportunity_id] = (viewCounts[v.opportunity_id] || 0) + 1 })
      const topIds = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)

      if (topIds.length > 0) {
        const { data: opps } = await supabase.from('opportunities').select('id, title, org_name, type').in('id', topIds)
        setTopOpportunities(opps?.map(op => ({ ...op, views: viewCounts[op.id] })) || [])
      }

      // Due soon — fetch saved opportunities and check deadlines
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

      // Recent activity
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
      { label: 'Opportunities viewed', value: stats.views, icon: '👁', color: '#3b82f6', bg: '#eff6ff' },
      { label: 'Saved', value: stats.saves, icon: '★', color: '#f59e0b', bg: '#fffbeb' },
      { label: 'Applied', value: stats.applications, icon: '✓', color: '#064e3b', bg: '#f0fdf4' },
    ]

    const activityLabels = { view: 'Viewed', save: 'Saved', apply: 'Applied to' }
    const activityColors = { view: '#3b82f6', save: '#f59e0b', apply: '#064e3b' }
    const activityBg = { view: '#eff6ff', save: '#fffbeb', apply: '#f0fdf4' }

    const statusConfig = {
      applied:   { label: 'Applied',   color: '#3b82f6', bg: '#eff6ff', icon: '✓' },
      interview: { label: 'Interview', color: '#8b5cf6', bg: '#f5f3ff', icon: '📞' },
      accepted:  { label: 'Accepted',  color: '#10b981', bg: '#f0fdf4', icon: '🎉' },
      rejected:  { label: 'Rejected',  color: '#ef4444', bg: '#fef2f2', icon: '✕' },
    }

    if (loading) return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
        Loading your analytics...
      </div>
    )

    return (
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 80px' }}>        {/* Page title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={styles.title}>Your activity</h1>
            <p style={styles.subtitle}>Track what you've explored, saved, and applied to</p>
          </div>
          <button style={styles.exportBtn} onClick={exportCSV}>↓ Export CSV</button>
        </div>

        {/* Due soon banner */}
        {dueSoon.length > 0 && !dismissedBanner && (
          <div style={styles.dueBanner}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1 }}>
              <span style={styles.dueIcon}>⏰</span>
              <div>
                <p style={styles.dueBannerTitle}>
                  {dueSoon.length} saved opportunit{dueSoon.length !== 1 ? 'ies are' : 'y is'} closing within 7 days
                </p>
                <div style={styles.dueBannerList}>
                  {dueSoon.map(op => {
                    const days = Math.ceil((new Date(op.deadline) - new Date()) / (1000 * 60 * 60 * 24))
                    return (
                      <span key={op.id} style={styles.dueBannerItem}>
                        <span style={{ fontWeight: '700', color: days <= 2 ? '#dc2626' : '#f59e0b' }}>
                          {days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`}
                        </span>
                        {' — '}{op.title}
                      </span>
                    )
                  })}
                </div>
              </div>
            </div>
            <button style={styles.dueDismiss} onClick={() => setDismissedBanner(true)}>✕</button>
          </div>
        )}

        {/* Stat cards */}
        <div style={styles.statsGrid}>
          {statCards.map(card => (
            <div key={card.label} style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: card.bg, color: card.color }}>
                {card.icon}
              </div>
              <div>
                <p style={styles.statValue}>{card.value}</p>
                <p style={styles.statLabel}>{card.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Most viewed + Recent activity */}
        <div style={styles.grid}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Most viewed</h3>
            <p style={styles.sectionSub}>Opportunities you keep coming back to</p>
            {topOpportunities.length === 0 ? (
              <div style={styles.emptyContainer}>
                <div style={styles.emptyIconLarge}>📊</div>
                <p style={styles.emptyText}>No views recorded yet</p>
                <p style={styles.emptySubtext}>Browse opportunities on your dashboard to see your interests here.</p>
                <button onClick={() => navigate('/dashboard')} style={styles.emptyBtn}>Start exploring</button>
              </div>
            ) : (
              <div style={styles.barList}>
                {topOpportunities.map(opp => {
                  const maxV = Math.max(...topOpportunities.map(o => o.views))
                  const pct = maxV > 0 ? (opp.views / maxV) * 100 : 0
                  return (
                    <div key={opp.id} style={styles.barItem}>
                      <div style={styles.barLabelRow}>
                        <span style={styles.barName}>{opp.title}</span>
                        <span style={styles.barCountLabel}>{opp.views} view{opp.views !== 1 ? 's' : ''}</span>
                      </div>
                      <div style={styles.barBackground}>
                        <div style={{ ...styles.barFill, width: `${pct}%`, backgroundColor: pct === 100 ? '#064e3b' : '#34d399' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Recent activity</h3>
            <p style={styles.sectionSub}>Your latest interactions</p>
            {recentActivity.length === 0 ? (
              <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '16px' }}>No activity yet</p>
            ) : (
              <div style={styles.activityList}>
                {recentActivity.map((item, i) => (
                  <div key={i} style={styles.activityRow}>
                    <div style={{ ...styles.activityDot, backgroundColor: activityBg[item.type], color: activityColors[item.type] }}>
                      {item.type === 'view' ? '👁' : item.type === 'save' ? '★' : '✓'}
                    </div>
                    <div>
                      <p style={styles.activityLabel}>{activityLabels[item.type]} an opportunity</p>
                      <p style={styles.activityDate}>
                        {new Date(item.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Application status breakdown */}
        {Object.keys(appStatusBreakdown).length > 0 && (
          <div style={{ ...styles.section, marginBottom: '24px' }}>
            <h3 style={styles.sectionTitle}>Application tracker</h3>
            <p style={styles.sectionSub}>Where your applications stand right now</p>
            <div style={styles.statusGrid}>
              {Object.entries(statusConfig).map(([key, cfg]) => {
                const count = appStatusBreakdown[key] || 0
                return (
                  <div key={key} style={{ ...styles.statusCard, backgroundColor: cfg.bg, borderColor: cfg.color + '30' }}>
                    <span style={styles.statusCardIcon}>{cfg.icon}</span>
                    <span style={{ ...styles.statusCardCount, color: cfg.color }}>{count}</span>
                    <span style={styles.statusCardLabel}>{cfg.label}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Your progress */}
        <div style={styles.progressSection}>
          <h3 style={styles.sectionTitle}>Your progress</h3>
          <p style={{ ...styles.sectionSub, marginBottom: '24px' }}>How you're moving through the pipeline</p>
          <div style={styles.progressCards}>
            <div style={styles.progressCard}>
              <div style={{ ...styles.progressNumber, backgroundColor: '#eff6ff', color: '#3b82f6' }}>{stats.views}</div>
              <p style={styles.progressLabel}>Viewed</p>
              <p style={styles.progressSmall}>opportunities</p>
            </div>
            <div style={styles.progressArrow}>→</div>
            <div style={styles.progressCard}>
              <div style={{ ...styles.progressNumber, backgroundColor: '#fffbeb', color: '#f59e0b' }}>{stats.saves}</div>
              <p style={styles.progressLabel}>Saved</p>
              <p style={styles.progressSmall}>{stats.views > 0 ? Math.round((stats.saves / stats.views) * 100) : 0}% of viewed</p>
            </div>
            <div style={styles.progressArrow}>→</div>
            <div style={styles.progressCard}>
              <div style={{ ...styles.progressNumber, backgroundColor: '#f0fdf4', color: '#064e3b' }}>{stats.applications}</div>
              <p style={styles.progressLabel}>Applied</p>
              <p style={styles.progressSmall}>{stats.saves > 0 ? Math.round((stats.applications / stats.saves) * 100) : 0}% of saved</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
  const styles = {
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
    backBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
    signOutBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
    exportBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', backgroundColor: '#f9fafb', color: '#374151', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
    pageTitle: { marginBottom: '24px' },
    title: { fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },

    // Due soon banner
    dueBanner: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: '12px',
      backgroundColor: '#fffbeb',
      border: '1.5px solid #fde68a',
      borderRadius: '14px',
      padding: '16px 20px',
      marginBottom: '24px',
    },
    dueIcon: { fontSize: '20px', flexShrink: 0, marginTop: '2px' },
    dueBannerTitle: { fontSize: '14px', fontWeight: '700', color: '#92400e', margin: '0 0 8px 0' },
    dueBannerList: { display: 'flex', flexDirection: 'column', gap: '4px' },
    dueBannerItem: { fontSize: '13px', color: '#78350f', lineHeight: 1.4 },
    dueDismiss: { background: 'none', border: 'none', color: '#d97706', fontSize: '16px', cursor: 'pointer', padding: '0', flexShrink: 0, fontWeight: '600' },

  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: '12px', marginBottom: '24px' },
    statCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
    statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
    statValue: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 2px 0', letterSpacing: '-0.5px' },
    statLabel: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' },

    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '24px', marginBottom: '24px' },

    section: { backgroundColor: '#fff', padding: '28px', borderRadius: '16px', border: '1px solid #e5e7eb' },
    sectionTitle: { fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 4px 0' },
    sectionSub: { fontSize: '13px', color: '#9ca3af', margin: '0 0 20px 0' },

    barList: { display: 'flex', flexDirection: 'column', gap: '14px' },
    barItem: { display: 'flex', flexDirection: 'column', gap: '6px' },
    barLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    barName: { fontSize: '13px', fontWeight: '600', color: '#374151', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%' },
    barCountLabel: { fontSize: '12px', color: '#9ca3af', fontWeight: '500' },
    barBackground: { height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' },
    barFill: { height: '100%', borderRadius: '4px', transition: 'width 0.7s ease' },

    emptyContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '32px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db', textAlign: 'center', marginTop: '8px' },
    emptyIconLarge: { fontSize: '28px', marginBottom: '10px' },
    emptyText: { fontSize: '15px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' },
    emptySubtext: { fontSize: '13px', color: '#6b7280', margin: '0 0 16px 0', maxWidth: '220px', lineHeight: '1.5' },
    emptyBtn: { padding: '8px 16px', backgroundColor: '#064e3b', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },

    activityList: { display: 'flex', flexDirection: 'column', gap: '14px' },
    activityRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
    activityDot: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 },
    activityLabel: { fontSize: '13px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' },
    activityDate: { fontSize: '12px', color: '#9ca3af', margin: 0 },

    // Application status cards
  statusGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(120px, 100%), 1fr))', gap: '12px', marginTop: '4px' },
    statusCard: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 12px', borderRadius: '12px', border: '1.5px solid transparent', gap: '4px' },
    statusCardIcon: { fontSize: '18px', marginBottom: '4px' },
    statusCardCount: { fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px', margin: 0 },
    statusCardLabel: { fontSize: '12px', color: '#6b7280', fontWeight: '500' },

    // Funnel — fixed
    progressSection: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' },
    funnelRow: { display: 'flex', gap: '50px', alignItems: 'flex-end', justifyContent: 'center', height: '140px', marginTop: '0px', padding: '16px' },
  funnelBar: { width: '70px', height: '100px', backgroundColor: '#eef2f7', borderRadius: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0', position: 'relative', order: 1 },
  funnelValue: { fontSize: '22px', fontWeight: '700', color: '#111', margin: '16px 0 0 0', letterSpacing: '-0.5px', order: 2 },  
  funnelRate: { fontSize: '11px', color: '#10b981', fontWeight: '700', margin: 0 },
  funnelFill: { width: '100%', borderRadius: '6px', transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  funnelStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '0 1 100px', justifyContent: 'flex-end' },
  progressCards: { display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' },
  progressCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', textAlign: 'center', minWidth: '120px' },
  progressNumber: { fontSize: '28px', fontWeight: '700', width: '60px', height: '60px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' },
  progressLabel: { fontSize: '14px', fontWeight: '700', color: '#111', margin: '0 0 4px 0' },
  progressSmall: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  progressArrow: { fontSize: '20px', color: '#d1d5db', fontWeight: '700' },
  }