import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'


export default function Analytics() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ views: 0, saves: 0, applications: 0 })
  const [topOpportunities, setTopOpportunities] = useState([])
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

async function fetchAnalytics() {
    // 1. We change .select(...) to .select('*') to stop the 400 errors
    const [viewsRes, savesRes, appsRes] = await Promise.all([
      supabase.from('opportunity_views').select('*').eq('user_id', user.id),
      supabase.from('saves').select('*').eq('user_id', user.id),
      supabase.from('applications').select('*').eq('user_id', user.id),
    ])

    // Safety check: if one fails, we at least have an empty array
    const views = viewsRes.data || []
    const saves = savesRes.data || []
    const apps = appsRes.data || []

    // Update the main stat cards
    setStats({ views: views.length, saves: saves.length, applications: apps.length })

    // Calculate Top Opportunities
    const viewCounts = {}
    views.forEach(v => { viewCounts[v.opportunity_id] = (viewCounts[v.opportunity_id] || 0) + 1 })

    const topIds = Object.entries(viewCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([id]) => id)

    if (topIds.length > 0) {
      const { data: opps } = await supabase.from('opportunities').select('id, title, org_name, type').in('id', topIds)
      setTopOpportunities(opps?.map(op => ({ ...op, views: viewCounts[op.id] })) || [])
    }

    // Recent Activity Logic 
    // We use optional chaining ?. because if created_at is missing, we don't want a crash
    const activity = [
      ...views.slice(-3).map(v => ({ type: 'view', id: v.opportunity_id, date: v.created_at || new Date().toISOString() })),
      ...saves.slice(-3).map(s => ({ type: 'save', id: s.opportunity_id, date: s.created_at || new Date().toISOString() })),
      ...apps.slice(-3).map(a => ({ type: 'apply', id: a.opportunity_id, date: a.created_at || new Date().toISOString() })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

    setRecentActivity(activity)
    setLoading(false)
  }

  const statCards = [
    { label: 'Opportunities viewed', value: stats.views, icon: '👁', color: '#3b82f6', bg: '#eff6ff' },
    { label: 'Saved', value: stats.saves, icon: '★', color: '#f59e0b', bg: '#fffbeb' },
    { label: 'Applied', value: stats.applications, icon: '✓', color: '#064e3b', bg: '#f0fdf4' },
  ]

  const activityLabels = { view: 'Viewed', save: 'Saved', apply: 'Applied to' }
  const activityColors = { view: '#3b82f6', save: '#f59e0b', apply: '#064e3b' }
  const activityBg = { view: '#eff6ff', save: '#fffbeb', apply: '#f0fdf4' }

  const maxViews = topOpportunities.length > 0 ? Math.max(...topOpportunities.map(o => o.views)) : 1

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '15px' }}>
      Loading your analytics...
    </div>
  )

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={styles.header} className="header">
        <Logo />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
          >
            ← Dashboard
          </button>
          <button
            style={styles.signOutBtn}
            onClick={signOut}
            onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={styles.pageTitle}>
        <h1 style={styles.title}>Your activity</h1>
        <p style={styles.subtitle}>Track what you've explored, saved, and applied to</p>
      </div>

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
      <div style={styles.grid}>
        {/* 3. MOST VIEWED SECTION */}
        <div style={styles.topSection}>
        <h3 style={styles.sectionTitle}>Most Viewed</h3>
        
        {topOpportunities.length === 0 ? (
            <div style={styles.emptyContainer}>
            <div style={styles.emptyIcon}>📊</div>
            <p style={styles.emptyText}>No views recorded yet.</p>
            <p style={styles.emptySubtext}>Explore opportunities on your dashboard to see your top interests here.</p>
            <button 
                onClick={() => navigate('/dashboard')}
                style={styles.emptyBtn}
            >
                Start Exploring
            </button>
            </div>
        ) : (
            <div style={styles.barList}>
            {topOpportunities.map(opp => {
                // Calculate width relative to the most viewed item
                const maxViewsValue = Math.max(...topOpportunities.map(o => o.views));
                const widthPercentage = maxViewsValue > 0 ? (opp.views / maxViewsValue) * 100 : 0;
                
                return (
                <div key={opp.id} style={styles.barItem}>
                    <div style={styles.barLabelRow}>
                    <span style={styles.barName}>{opp.title}</span>
                    <span style={styles.barCount}>{opp.views} views</span>
                    </div>
                    <div style={styles.barBackground}>
                    <div 
                        style={{
                        ...styles.barFill, 
                        width: `${widthPercentage}%`,
                        backgroundColor: widthPercentage === 100 ? '#064e3b' : '#34d399' 
                        }} 
                    />
                    </div>
                </div>
                );
            })}
            </div>
        )}
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Recent activity</h3>
          <p style={styles.sectionSub}>Your latest interactions</p>
          {recentActivity.length === 0 ? (
            <p style={styles.emptyText}>No activity yet</p>
          ) : (
            <div style={styles.activityList}>
              {recentActivity.map((item, i) => (
                <div key={i} style={styles.activityRow}>
                  <div style={{
                    ...styles.activityDot,
                    backgroundColor: activityBg[item.type],
                    color: activityColors[item.type],
                  }}>
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
        {/* 2. APPLICATION FUNNEL */}
        <div style={styles.progressSection}>
          <h3 style={styles.sectionTitle}>Application funnel</h3>
          <p style={styles.sectionSub}>Your conversion from browsing to applying</p>
          <div style={styles.funnelRow}>
            {[
              { label: 'Viewed', value: stats.views, color: '#3b82f6' },
              { label: 'Saved', value: stats.saves, color: '#f59e0b' },
              { label: 'Applied', value: stats.applications, color: '#064e3b' },
            ].map((step) => {
              // Calculate percentage relative to 'Viewed'
              const percentage = stats.views > 0 ? Math.round((step.value / stats.views) * 100) : 0;
              
              return (
                <div key={step.label} style={styles.funnelStep}>
                  <div style={styles.funnelBar}>
                    <div style={{
                      ...styles.funnelFill,
                      height: `${stats.views > 0 ? (step.value / stats.views) * 100 : 0}%`,
                      backgroundColor: step.color,
                      minHeight: step.value > 0 ? '8px' : '0',
                    }}/>
                  </div>
                  <p style={styles.funnelValue}>{step.value}</p>
                  <p style={styles.funnelLabel}>{step.label}</p>
                  {step.label !== 'Viewed' && (
                    <p style={{ fontSize: '10px', color: '#10b981', fontWeight: '600', marginTop: '2px' }}>
                      {percentage}% rate
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
    </div>
  )
}

const styles = {
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  logoText: { fontSize: '22px', fontWeight: '700', color: '#064e3b', letterSpacing: '-0.5px' },
  backBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease' },
  signOutBtn: { padding: '9px 16px', borderRadius: '10px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease' },
  pageTitle: { marginBottom: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '16px', marginBottom: '28px' },
  statCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', display: 'flex', alignItems: 'center', gap: '16px' },
  statIcon: { width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 2px 0', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(340px, 100%), 1fr))', gap: '24px', marginBottom: '24px' },
  topSection: {
    backgroundColor: '#fff',
    padding: '28px',
    borderRadius: '16px',
    border: '1px solid #e5e7eb',
    marginBottom: '24px',
  },
  barList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginTop: '16px',
  },
  barItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  barLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '600',
  },
  barName: {
    color: '#374151',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '70%',
  },
  barCount: {
    color: '#6b7280',
  },
  barBackground: {
    height: '8px',
    backgroundColor: '#f3f4f6',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.8s ease',
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    border: '1px dashed #d1d5db',
    textAlign: 'center',
    marginTop: '16px',
  },
  emptyIcon: { fontSize: '32px', marginBottom: '12px' },
  emptyText: { fontSize: '16px', fontWeight: '600', color: '#374151', margin: '0 0 4px 0' },
  emptySubtext: { fontSize: '13px', color: '#6b7280', margin: '0 0 20px 0', maxWidth: '250px', lineHeight: '1.5' },
  emptyBtn: {
    padding: '8px 16px',
    backgroundColor: '#064e3b',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  barList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  barRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  barMeta: { display: 'flex', flexDirection: 'column', width: '140px', flexShrink: 0 },
  barTitle: { fontSize: '13px', fontWeight: '600', color: '#111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  barOrg: { fontSize: '11px', color: '#9ca3af' },
  barTrack: { flex: 1, height: '8px', backgroundColor: '#f3f4f6', borderRadius: '4px', overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#064e3b', borderRadius: '4px', transition: 'width 0.6s ease' },
  barCount: { fontSize: '13px', fontWeight: '600', color: '#064e3b', width: '24px', textAlign: 'right' },
  activityList: { display: 'flex', flexDirection: 'column', gap: '16px' },
  activityRow: { display: 'flex', alignItems: 'flex-start', gap: '12px' },
  activityDot: { width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', flexShrink: 0 },
  activityLabel: { fontSize: '13px', fontWeight: '600', color: '#111', margin: '0 0 2px 0' },
  activityDate: { fontSize: '12px', color: '#9ca3af', margin: 0 },
  progressSection: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '28px' },
  funnelRow: { display: 'flex', gap: '24px', alignItems: 'flex-end', height: '140px', marginTop: '16px' },
  funnelStep: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 },
  funnelBar: { width: '100%', height: '100px', backgroundColor: '#f9fafb', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', overflow: 'hidden', border: '1px solid #f3f4f6' },
  funnelFill: { width: '100%', borderRadius: '8px', transition: 'height 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' },
  funnelValue: { fontSize: '20px', fontWeight: '700', color: '#111', margin: 0, letterSpacing: '-0.5px' },
  funnelLabel: { fontSize: '12px', color: '#6b7280', margin: 0, fontWeight: '500' },
}