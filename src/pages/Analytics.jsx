import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getAnalytics } from '../lib/dbHelpers'
import { supabase } from '../lib/supabase'
import Footer from '../components/Footer'

export default function Analytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalViews: 0, totalSaves: 0, totalApps: 0, avgTimeToApply: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (user) fetchAnalytics()
  }, [user])

  async function fetchAnalytics() {
    const { views, saves, applications, metadata } = await getAnalytics(user.id)

    setStats({
      totalViews: views.length,
      totalSaves: saves.length,
      totalApps: applications.length,
      avgTimeToApply: applications.length > 0
        ? Math.round(applications.reduce((sum, app) => {
            const meta = metadata.find(m => m.opportunity_id === app.opportunity_id)
            const savedAt = meta?.saved_at ? new Date(meta.saved_at) : new Date(app.created_at)
            const appliedAt = new Date(app.applied_at || app.created_at)
            return sum + (appliedAt - savedAt)
          }, 0) / applications.length / (1000 * 60 * 60 * 24))
        : 0,
    })

    const allActivityIds = [
      ...views.map(v => v.opportunity_id),
      ...saves.map(s => s.opportunity_id),
      ...applications.map(a => a.opportunity_id),
    ]
    const uniqueIds = [...new Set(allActivityIds)]

    let activityTitles = {}
    if (uniqueIds.length > 0) {
      const { data: activityOpps } = await supabase
        .from('opportunities')
        .select('id, title')
        .in('id', uniqueIds)
      activityOpps?.forEach(op => { activityTitles[op.id] = op.title })
    }

    const activity = [
      ...views.slice(-3).map(v => ({ type: 'view', id: v.opportunity_id, title: activityTitles[v.opportunity_id] || 'An opportunity', date: v.created_at || new Date().toISOString() })),
      ...saves.slice(-3).map(s => ({ type: 'save', id: s.opportunity_id, title: activityTitles[s.opportunity_id] || 'An opportunity', date: s.created_at || new Date().toISOString() })),
      ...applications.slice(-3).map(a => ({ type: 'apply', id: a.opportunity_id, title: activityTitles[a.opportunity_id] || 'An opportunity', date: a.created_at || new Date().toISOString() })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

    setRecentActivity(activity)
    setLoading(false)
  }

  const activityConfig = {
    view: { label: 'Viewed', color: '#6366f1' },
    save: { label: 'Saved', color: '#f59e0b' },
    apply: { label: 'Applied to', color: '#3fb950' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '28px', height: '28px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ fontSize: '13px', color: '#484f58', fontFamily: 'DM Sans, sans-serif' }}>Loading analytics...</span>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', margin: '0 0 6px 0', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Your analytics</h1>
        <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>Track your progress and activity</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(240px, 100%), 1fr))', gap: '16px', marginBottom: '32px' }}>
        {[
          { label: 'Total views', value: stats.totalViews, icon: '👁️' },
          { label: 'Saved', value: stats.totalSaves, icon: '💾' },
          { label: 'Applied', value: stats.totalApps, icon: '✓' },
          { label: 'Avg days to apply', value: stats.avgTimeToApply, icon: '⏱️' },
        ].map(stat => (
          <div key={stat.label} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
            <p style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '800', color: '#e6edf3', margin: '8px 0 0 0', fontFamily: "'Syne', sans-serif" }}>{stat.value}</p>
          </div>
        ))}
      </div>

      {recentActivity.length > 0 && (
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '24px' }}>
          <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: '0 0 16px 0', fontFamily: "'Syne', sans-serif" }}>Recent activity</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentActivity.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: idx < recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: activityConfig[item.type].color, fontSize: '14px' }}>
                  {item.type === 'view' && '👁️'}
                  {item.type === 'save' && '💾'}
                  {item.type === 'apply' && '✓'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', margin: '0 0 2px' }}>{activityConfig[item.type].label}</p>
                  <p style={{ fontSize: '12px', color: '#7d8590', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>{item.title}</p>
                  <p style={{ fontSize: '11px', color: '#484f58', margin: 0 }}>{new Date(item.date).toLocaleDateString('en-CA')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}