import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'

export default function Analytics() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ totalViews: 0, totalSaves: 0, totalApps: 0 })
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)

  async function fetchAnalytics() {
    try {
      const [savesRes, appsRes, viewsRes, oppsRes] = await Promise.all([
        fetch(`/api/saves?userId=${user.id}`),
        fetch(`/api/applications?userId=${user.id}`),
        fetch(`/api/views?userId=${user.id}`),
        fetch('/api/opportunities'),
      ])
      const saves = await savesRes.json()
      const apps = await appsRes.json()
      const views = await viewsRes.json()
      const opps = await oppsRes.json()

      setStats({
        totalViews: Array.isArray(views) ? views.length : 0,
        totalSaves: Array.isArray(saves) ? saves.length : 0,
        totalApps: Array.isArray(apps) ? apps.length : 0,
      })

      const oppMap = {}
      if (Array.isArray(opps)) opps.forEach(o => { oppMap[o.id] = o.title })

      const activity = [
        ...(Array.isArray(views) ? views.slice(-3).map(v => ({ type: 'view', id: v.opportunity_id, title: oppMap[v.opportunity_id] || 'An opportunity', date: v.created_at || new Date().toISOString() })) : []),
        ...(Array.isArray(saves) ? saves.slice(-3).map(s => ({ type: 'save', id: s, title: oppMap[s] || 'An opportunity', date: new Date().toISOString() })) : []),
        ...(Array.isArray(apps) ? apps.slice(-3).map(a => ({ type: 'apply', id: a, title: oppMap[a] || 'An opportunity', date: new Date().toISOString() })) : []),
      ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6)

      setRecentActivity(activity)
    } catch (err) {
      console.error('Analytics fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) fetchAnalytics()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const activityConfig = {
    view: { label: 'Viewed', color: 'var(--accent-violet)' },
    save: { label: 'Saved', color: 'var(--warning)' },
    apply: { label: 'Applied to', color: 'var(--success)' },
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-base)' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid var(--accent-violet-muted)', borderTopColor: 'var(--accent-violet)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-base)', fontFamily: 'var(--font-sans)' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 24px 80px' }}>

        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 6px', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' }}>Your analytics</h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0 }}>Track your progress and activity</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(200px, 100%), 1fr))', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Total views', value: stats.totalViews, icon: '👁️' },
            { label: 'Saved', value: stats.totalSaves, icon: '🔖' },
            { label: 'Applied', value: stats.totalApps, icon: '✓' },
          ].map(stat => (
            <div key={stat.label} style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '20px' }}>
              <div style={{ fontSize: '20px', marginBottom: '8px' }}>{stat.icon}</div>
              <p style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', margin: 0 }}>{stat.label}</p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)', margin: '8px 0 0', fontFamily: 'var(--font-display)' }}>{stat.value}</p>
            </div>
          ))}
        </div>

        {recentActivity.length > 0 && (
          <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--text-primary)', margin: '0 0 16px', fontFamily: 'var(--font-display)' }}>Recent activity</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {recentActivity.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--border-default)' : 'none' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '14px' }}>
                    {item.type === 'view' && '👁️'}
                    {item.type === 'save' && '🔖'}
                    {item.type === 'apply' && '✓'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: activityConfig[item.type].color, margin: '0 0 2px' }}>{activityConfig[item.type].label}</p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '220px' }}>{item.title}</p>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0 }}>{new Date(item.date).toLocaleDateString('en-CA')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  )
}