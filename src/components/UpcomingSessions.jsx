import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

function timeUntil(dateStr) {
  const diff = new Date(dateStr).getTime() - Date.now()
  if (diff < 0) return 'Passed'
  const days = Math.floor(diff / 86400000)
  const hours = Math.floor((diff % 86400000) / 3600000)
  if (days > 0) return `In ${days}d ${hours}h`
  if (hours > 0) return `In ${hours}h`
  return 'Starting soon'
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-CA', {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function UpcomingSessions({ opportunity }) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [signedUp, setSignedUp] = useState({})
  const [loading, setLoading] = useState(true)
  const [signingUp, setSigningUp] = useState(null)

  useEffect(() => {
    if (opportunity) fetchSessions()
  }, [opportunity?.id])

  async function fetchSessions() {
    setLoading(true)

    const { data, error } = await supabase
      .from('sessions')
      .select('*, mentors(full_name, role, institution, linkedin_url)')
      .eq('is_active', true)
      .gte('session_date', new Date().toISOString())
      .order('session_date', { ascending: true })

    if (error || !data) { setLoading(false); return }

    // Match sessions to this opportunity by type or interest tags
    const oppTags = (opportunity.interest_tags || []).map(t => t.toLowerCase())
    const oppType = (opportunity.type || '').toLowerCase()

    const matched = data.filter(session => {
      const sessionTags = (session.interest_tags || []).map(t => t.toLowerCase())
      const sessionTypes = (session.opportunity_types || []).map(t => t.toLowerCase())
      const tagMatch = sessionTags.some(t => oppTags.includes(t))
      const typeMatch = sessionTypes.includes(oppType)
      return tagMatch || typeMatch
    }).slice(0, 3)

    setSessions(matched)

    // Check which ones user has signed up for
    if (user && matched.length > 0) {
      const { data: signups } = await supabase
        .from('session_signups')
        .select('session_id')
        .eq('user_id', user.id)
        .in('session_id', matched.map(s => s.id))

      if (signups) {
        const map = {}
        signups.forEach(s => { map[s.session_id] = true })
        setSignedUp(map)
      }
    }

    setLoading(false)
  }

  async function handleSignup(session) {
    if (!user) return
    setSigningUp(session.id)

    if (signedUp[session.id]) {
      // Cancel signup
      await supabase
        .from('session_signups')
        .delete()
        .eq('session_id', session.id)
        .eq('user_id', user.id)
      setSignedUp(prev => ({ ...prev, [session.id]: false }))
    } else {
      // Sign up
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      await supabase
        .from('session_signups')
        .insert({
          session_id: session.id,
          user_id: user.id,
          email: user.email,
          full_name: profile?.full_name || null,
        })
      setSignedUp(prev => ({ ...prev, [session.id]: true }))
    }

    setSigningUp(null)
  }

  if (loading || sessions.length === 0) return null

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ marginBottom: '14px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 3px', fontFamily: "'Syne', sans-serif" }}>
          🎓 Sessions that help you win this
        </h3>
        <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>
          Live group sessions hosted by mentors — free to join
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {sessions.map(session => {
          const isSignedUp = signedUp[session.id]
          const isSigning = signingUp === session.id
          const mentor = session.mentors

          return (
            <div key={session.id} style={{
              backgroundColor: '#161b22',
              border: `1px solid ${isSignedUp ? 'rgba(63,185,80,0.25)' : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '12px',
              padding: '16px 18px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '16px',
            }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>
                    {session.title}
                  </span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: '700',
                    backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                    border: '1px solid rgba(245,158,11,0.2)',
                  }}>
                    {timeUntil(session.session_date)}
                  </span>
                </div>

                <p style={{ fontSize: '12px', color: '#7d8590', margin: '0 0 8px', lineHeight: 1.5 }}>
                  {session.description}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: '#484f58' }}>
                    🗓️ {formatDate(session.session_date)}
                  </span>
                  <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                  <span style={{ fontSize: '11px', color: '#484f58' }}>
                    ⏱️ {session.duration_minutes} min
                  </span>
                  {mentor && (
                    <>
                      <span style={{ color: '#30363d', fontSize: '10px' }}>•</span>
                      <span style={{ fontSize: '11px', color: '#484f58' }}>
                        👤 {mentor.full_name}
                        {mentor.institution ? ` · ${mentor.institution}` : ''}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flexShrink: 0 }}>
                <button
                  onClick={() => handleSignup(session)}
                  disabled={isSigning || !user}
                  style={{
                    padding: '8px 14px', borderRadius: '8px', border: 'none',
                    backgroundColor: isSignedUp ? 'rgba(63,185,80,0.1)' : '#f59e0b',
                    color: isSignedUp ? '#3fb950' : '#0d1117',
                    fontSize: '12px', fontWeight: '700', cursor: isSigning ? 'wait' : 'pointer',
                    fontFamily: 'inherit', whiteSpace: 'nowrap',
                    border: isSignedUp ? '1px solid rgba(63,185,80,0.3)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {isSigning ? '...' : isSignedUp ? '✓ Signed up' : 'Join session'}
                </button>

                {isSignedUp && (
                  <a
                    href={session.meeting_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: '8px 14px', borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.08)',
                      backgroundColor: 'transparent', color: '#7d8590',
                      fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                      fontFamily: 'inherit', textDecoration: 'none',
                      textAlign: 'center', whiteSpace: 'nowrap',
                    }}
                  >
                    Open link →
                  </a>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}