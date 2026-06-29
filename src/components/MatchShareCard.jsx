import { useEffect, useState } from 'react'
import { calculateMatchScore } from '../lib/opportunityMatcher'

export default function MatchShareCard({ profile, onClose, onGoToDashboard }) {
  const [matchCount, setMatchCount] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  async function fetchMatchCount() {
    const res = await fetch('/api/opportunities')
    const data = await res.json()
    if (!Array.isArray(data)) { setLoading(false); return }
    const matched = data.filter(opp => calculateMatchScore(opp, profile) >= 30)
    setMatchCount(matched.length)
    setLoading(false)
  }

  useEffect(() => {
    fetchMatchCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleCopy() {
    const text = `Just joined Verto and matched ${matchCount} opportunities for Canadian students 🎯 Find yours at verto-indol.vercel.app`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  function handleShare() {
    const text = `Just joined Verto and matched ${matchCount} opportunities for Canadian students 🎯 Find yours at verto-indol.vercel.app`
    if (navigator.share) {
      navigator.share({ text })
    } else {
      handleCopy()
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 9999, padding: '24px',
      fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{
        background: '#0d1117',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '40px 36px',
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        position: 'relative',
      }}>

        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '16px', right: '16px',
            background: 'none', border: 'none', color: '#484f58',
            fontSize: '18px', cursor: 'pointer', lineHeight: 1,
          }}
        >
          ✕
        </button>

        {/* Confetti emoji row */}
        <div style={{ fontSize: '32px', marginBottom: '20px', letterSpacing: '4px' }}>🎉🇨🇦✨</div>

        {/* Match count card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(6,78,59,0.3) 0%, rgba(52,211,153,0.1) 100%)',
          border: '1px solid rgba(52,211,153,0.25)',
          borderRadius: '16px',
          padding: '28px 24px',
          marginBottom: '24px',
        }}>
          <p style={{ fontSize: '13px', color: '#6ee7b7', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 8px' }}>
            Your match results
          </p>
          {loading ? (
            <div style={{ fontSize: '48px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
              —
            </div>
          ) : (
            <div style={{ fontSize: '64px', fontWeight: '800', color: '#34d399', fontFamily: "'Syne', sans-serif", lineHeight: 1 }}>
              {matchCount}
            </div>
          )}
          <p style={{ fontSize: '15px', color: '#e6edf3', fontWeight: '600', margin: '8px 0 0' }}>
            opportunities matched to you
          </p>
          {profile?.province && (
            <p style={{ fontSize: '12px', color: '#7d8590', margin: '6px 0 0' }}>
              Grade {profile.grade} · {profile.province} · {profile.interests?.length || 0} interests selected
            </p>
          )}
        </div>

        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
          You're in. Let's go.
        </h2>
        <p style={{ fontSize: '14px', color: '#7d8590', margin: '0 0 28px', lineHeight: 1.6 }}>
          Share your match count and let your friends find out how many they'd match.
        </p>

        {/* Share preview text */}
        <div style={{
          background: '#161b22',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '10px',
          padding: '14px 16px',
          marginBottom: '20px',
          textAlign: 'left',
          fontSize: '13px',
          color: '#8b949e',
          lineHeight: 1.5,
        }}>
          Just joined Verto and matched <span style={{ color: '#34d399', fontWeight: '700' }}>{matchCount ?? '...'} opportunities</span> for Canadian students 🎯 Find yours at <span style={{ color: '#34d399' }}>verto-indol.vercel.app</span>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button
            onClick={handleShare}
            style={{
              padding: '13px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg, #064e3b, #059669)',
              color: '#fff', fontSize: '14px', fontWeight: '700',
              cursor: 'pointer', fontFamily: 'inherit',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            {copied ? '✓ Copied!' : '🔗 Share my results'}
          </button>
          <button
            onClick={onGoToDashboard}
            style={{
              padding: '13px', borderRadius: '10px',
              border: '1px solid rgba(255,255,255,0.08)',
              background: 'transparent',
              color: '#7d8590', fontSize: '14px', fontWeight: '600',
              cursor: 'pointer', fontFamily: 'inherit',
            }}
          >
            Go to my dashboard →
          </button>
        </div>

      </div>
    </div>
  )
}