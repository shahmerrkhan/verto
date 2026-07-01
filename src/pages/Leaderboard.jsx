import { useEffect, useState } from 'react'
import { useResponsive, COMPONENT, COLORS } from '../config/responsive'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'

const TYPE_COLORS = {
  scholarship: { color: '#818cf8', bg: 'rgba(129,140,248,0.1)', border: 'rgba(129,140,248,0.2)' },
  competition: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.2)' },
  internship:  { color: '#3fb950', bg: 'rgba(63,185,80,0.1)',  border: 'rgba(63,185,80,0.2)'  },
  program:     { color: '#c084fc', bg: 'rgba(192,132,252,0.1)', border: 'rgba(192,132,252,0.2)' },
  grant:       { color: '#58a6ff', bg: 'rgba(88,166,255,0.1)',  border: 'rgba(88,166,255,0.2)'  },
}

function getTypeStyle(type) {
  return TYPE_COLORS[type?.toLowerCase()] || { color: '#8b949e', bg: 'rgba(139,148,158,0.1)', border: 'rgba(139,148,158,0.2)' }
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

const FILTERS = ['All', 'Won', 'Finalist']
const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'prize', label: 'Highest prize' },
]

export default function Leaderboard() {
  const [winners, setWinners] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [sortBy, setSortBy] = useState('recent')
  const [search, setSearch] = useState('')
  const [stats, setStats] = useState({ total: 0, totalPrize: 0, schools: 0 })
  const navigate = useNavigate()
  const { isMobile, isTablet } = useResponsive()

  useEffect(() => { fetchWinners() }, [])

  async function fetchWinners() {
    try {
      const res = await fetch('/api/winners')
      const json = await res.json()
      const data = json.data
      if (Array.isArray(data)) {
        setWinners(data)
        const uniqueSchools = new Set(data.filter(w => w.school).map(w => w.school)).size
        const totalPrize = data.reduce((sum, w) => sum + (w.prize_amount || 0), 0)
        setStats({ total: data.length, totalPrize, schools: uniqueSchools })
      }
    } catch (err) {
      console.error('Failed to fetch winners:', err)
    } finally {
      setLoading(false)
    }
  }
  
  const filtered = winners
    .filter(w => {
      const matchesFilter = filter === 'All' || (filter === 'Won' && w.outcome === 'won') || (filter === 'Finalist' && w.outcome === 'finalist')
      const matchesSearch = !search || 
        w.display_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.opportunity_title?.toLowerCase().includes(search.toLowerCase()) ||
        w.org_name?.toLowerCase().includes(search.toLowerCase()) ||
        w.school?.toLowerCase().includes(search.toLowerCase())
      return matchesFilter && matchesSearch
    })
    .sort((a, b) => {
      if (sortBy === 'prize') return (b.prize_amount || 0) - (a.prize_amount || 0)
      return new Date(b.won_at) - new Date(a.won_at)
    })

  const pill = (active) => ({
    padding: '5px 14px', borderRadius: '20px', border: '1px solid',
    borderColor: active ? '#f59e0b' : 'rgba(255,255,255,0.08)',
    backgroundColor: active ? 'rgba(245,158,11,0.1)' : 'transparent',
    color: active ? '#f59e0b' : '#7d8590',
    fontSize: '12px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.15s', fontFamily: 'inherit',
  })

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', flexDirection: 'column', gap: '12px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '24px', height: '24px', border: '2px solid rgba(245,158,11,0.2)', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontSize: '13px', color: '#484f58' }}>Loading leaderboard...</span>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '96px 24px 80px' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Hall of Fame</span>
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
            Winners Leaderboard
          </h1>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>
            Real students. Real wins. All found on Verto.
          </p>
        </div>

        {/* Stats bar */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${isMobile ? COMPONENT.leaderboard.mobileStatsColumns : isTablet ? COMPONENT.leaderboard.tabletStatsColumns : COMPONENT.leaderboard.desktopStatsColumns}, 1fr)`, gap: '12px', marginBottom: '28px' }}>
          {[
            { label: 'Total wins', value: stats.total, icon: '🏆' },
            { label: 'Prize value', value: stats.totalPrize > 0 ? `$${stats.totalPrize.toLocaleString()}` : '—', icon: '💰' },
            { label: 'Schools represented', value: stats.schools || '—', icon: '🏫' },
          ].map(s => (
            <div key={s.label} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px 20px' }}>
              <div style={{ fontSize: '20px', marginBottom: '4px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
              <div style={{ fontSize: '11px', color: '#484f58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', gap: '5px' }}>
            {FILTERS.map(f => (
              <button key={f} style={pill(filter === f)} onClick={() => setFilter(f)}>{f}</button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '5px', marginLeft: 'auto' }}>
            {SORT_OPTIONS.map(s => (
              <button key={s.value} style={pill(sortBy === s.value)} onClick={() => setSortBy(s.value)}>{s.label}</button>
            ))}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search by name, opportunity, school..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', padding: '10px 14px', borderRadius: '10px',
            border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#161b22',
            color: '#e6edf3', fontSize: '13px', fontFamily: 'inherit',
            outline: 'none', marginBottom: '20px', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
        />

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 24px', backgroundColor: '#161b22', borderRadius: '16px', border: '2px dashed rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '32px', marginBottom: '16px' }}>🏆</p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#e6edf3', marginBottom: '8px', fontFamily: "'Syne', sans-serif" }}>
              {winners.length === 0 ? 'No wins logged yet' : 'No results found'}
            </h3>
            <p style={{ fontSize: '14px', color: '#484f58', marginBottom: '24px' }}>
              {winners.length === 0
                ? 'Be the first. Apply to something, win, and log your outcome.'
                : 'Try a different search or filter.'}
            </p>
            {winners.length === 0 && (
              <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Find opportunities
              </button>
            )}
          </div>
        )}

        {/* Winner cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filtered.map((w, i) => (
            <div key={w.id} style={{
              backgroundColor: '#161b22',
              border: `1px solid ${w.outcome === 'won' ? 'rgba(63,185,80,0.2)' : 'rgba(245,158,11,0.15)'}`,
              borderRadius: '14px', 
              padding: isMobile ? COMPONENT.leaderboard.mobileWinnerPadding : COMPONENT.leaderboard.desktopWinnerPadding,
              display: 'flex', alignItems: 'flex-start', gap: '16px',
              transition: 'border-color 0.2s',
            }}>

              {/* Rank */}
              <div style={{
                minWidth: '36px', height: '36px', borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: i === 0 ? 'rgba(245,158,11,0.15)' : i === 1 ? 'rgba(129,140,248,0.1)' : i === 2 ? 'rgba(248,81,73,0.08)' : 'rgba(255,255,255,0.04)',
                fontSize: i < 3 ? '18px' : '13px',
                fontWeight: '800', color: i === 0 ? '#f59e0b' : i === 1 ? '#818cf8' : i === 2 ? '#f85149' : '#484f58',
                fontFamily: "'Syne', sans-serif", flexShrink: 0,
              }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>

              {/* Main content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '15px', fontWeight: '700', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>
                    {w.display_name}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '700',
                    backgroundColor: w.outcome === 'won' ? 'rgba(63,185,80,0.12)' : 'rgba(245,158,11,0.12)',
                    color: w.outcome === 'won' ? '#3fb950' : '#f59e0b',
                    border: `1px solid ${w.outcome === 'won' ? 'rgba(63,185,80,0.25)' : 'rgba(245,158,11,0.25)'}`,
                  }}>
                    {w.outcome === 'won' ? '🏆 Won' : '🥈 Finalist'}
                  </span>
                </div>

                <p style={{ fontSize: '13px', fontWeight: '600', color: '#e6edf3', margin: '0 0 4px' }}>
                  {w.opportunity_title}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  {w.org_name && (
                    <span style={{ fontSize: '12px', color: '#7d8590' }}>{w.org_name}</span>
                  )}
                  {w.school && (
                    <>
                      <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '12px', color: '#7d8590' }}>🏫 {w.school}</span>
                    </>
                  )}
                  {w.grade && (
                    <>
                      <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '12px', color: '#7d8590' }}>Grade {w.grade}</span>
                    </>
                  )}
                  {w.province && (
                    <>
                      <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '12px', color: '#7d8590' }}>{w.province}</span>
                    </>
                  )}
                  <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                  <span style={{ fontSize: '12px', color: '#484f58' }}>{timeAgo(w.won_at)}</span>
                </div>

                {w.outcome_note && (
                  <p style={{ fontSize: '12px', color: '#8b949e', margin: '8px 0 0', fontStyle: 'italic', lineHeight: 1.5 }}>
                    "{w.outcome_note}"
                  </p>
                )}
              </div>

              {/* Prize */}
              {w.prize_amount > 0 && (
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: '16px', fontWeight: '800', color: '#3fb950', fontFamily: "'Syne', sans-serif" }}>
                    ${w.prize_amount.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '10px', color: '#484f58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>prize</div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA at bottom */}
        {filtered.length > 0 && (
          <div style={{ marginTop: '40px', textAlign: 'center', padding: '32px', backgroundColor: '#161b22', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <p style={{ fontSize: '16px', fontWeight: '700', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
              Your name could be up here.
            </p>
            <p style={{ fontSize: '13px', color: '#7d8590', margin: '0 0 20px' }}>
              Find an opportunity that fits you, apply, and log your win.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              style={{ padding: '11px 28px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Find my opportunities →
            </button>
          </div>
        )}

      </div>
      <Footer />
    </div>
  )
}