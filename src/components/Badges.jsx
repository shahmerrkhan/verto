import { useEffect, useRef, useState } from 'react'

export const BADGE_DEFINITIONS = [
  {
    id: 'first_save',
    emoji: '🌟',
    label: 'First Save',
    description: 'Saved your first opportunity',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.12)',
    border: 'rgba(245,158,11,0.25)',
  },
  {
    id: 'collector',
    emoji: '⭐',
    label: 'Collector',
    description: 'Saved 5 opportunities',
    color: '#818cf8',
    bg: 'rgba(129,140,248,0.12)',
    border: 'rgba(129,140,248,0.25)',
  },
  {
    id: 'explorer',
    emoji: '🎯',
    label: 'Explorer',
    description: 'Saved 10 opportunities',
    color: '#c084fc',
    bg: 'rgba(192,132,252,0.12)',
    border: 'rgba(192,132,252,0.25)',
  },
  {
    id: 'applied',
    emoji: '📝',
    label: 'Applied',
    description: 'Tracked your first application',
    color: '#3fb950',
    bg: 'rgba(63,185,80,0.12)',
    border: 'rgba(63,185,80,0.25)',
  },
  {
    id: 'applicant',
    emoji: '🚀',
    label: 'Applicant',
    description: 'Tracked 5 applications',
    color: '#38bdf8',
    bg: 'rgba(56,189,248,0.12)',
    border: 'rgba(56,189,248,0.25)',
  },
  {
    id: 'winner',
    emoji: '🏆',
    label: 'Winner',
    description: 'Marked an acceptance',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.12)',
    border: 'rgba(251,191,36,0.25)',
  },
  {
    id: 'speed_demon',
    emoji: '⚡',
    label: 'Speed Demon',
    description: 'Applied within 24hrs of saving',
    color: '#f85149',
    bg: 'rgba(248,81,73,0.12)',
    border: 'rgba(248,81,73,0.25)',
  },
]

/**
 * Notification that animates in from bottom-right when a badge is earned.
 */
export function BadgeUnlockNotification({ badge, onDismiss }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Small delay so the animation triggers after mount
    const enter = setTimeout(() => setVisible(true), 30)
    const exit = setTimeout(() => {
      setVisible(false)
      setTimeout(onDismiss, 350)
    }, 4000)
    return () => { clearTimeout(enter); clearTimeout(exit) }
  }, [onDismiss])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '14px 18px',
        backgroundColor: '#161b22',
        border: `1px solid ${badge.border}`,
        borderRadius: '14px',
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${badge.border}`,
        fontFamily: 'DM Sans, sans-serif',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
        maxWidth: '280px',
        cursor: 'pointer',
      }}
      onClick={() => { setVisible(false); setTimeout(onDismiss, 350) }}
    >
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          backgroundColor: badge.bg,
          border: `1px solid ${badge.border}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          flexShrink: 0,
          animation: 'badgePop 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both',
        }}
      >
        {badge.emoji}
      </div>
      <div>
        <p style={{ margin: '0 0 2px', fontSize: '10px', fontWeight: '700', color: badge.color, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          Badge earned!
        </p>
        <p style={{ margin: '0 0 1px', fontSize: '14px', fontWeight: '700', color: '#e6edf3' }}>
          {badge.label}
        </p>
        <p style={{ margin: 0, fontSize: '11px', color: '#7d8590' }}>
          {badge.description}
        </p>
      </div>

      <style>{`
        @keyframes badgePop {
          0% { transform: scale(0.6) rotate(-8deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(3deg); }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/**
 * Grid of all badges. Pass unlockedBadges as string[].
 */
export function BadgeGrid({ unlockedBadges = [] }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '10px',
      }}
    >
      {BADGE_DEFINITIONS.map(badge => {
        const earned = unlockedBadges.includes(badge.id)
        return (
          <div
            key={badge.id}
            title={badge.description}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              padding: '16px 12px',
              borderRadius: '12px',
              backgroundColor: earned ? badge.bg : 'rgba(255,255,255,0.02)',
              border: `1px solid ${earned ? badge.border : 'rgba(255,255,255,0.06)'}`,
              transition: 'all 0.2s ease',
              opacity: earned ? 1 : 0.4,
              filter: earned ? 'none' : 'grayscale(1)',
            }}
          >
            <span style={{ fontSize: '26px', lineHeight: 1 }}>{badge.emoji}</span>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 2px', fontSize: '12px', fontWeight: '700', color: earned ? badge.color : '#484f58' }}>
                {badge.label}
              </p>
              <p style={{ margin: 0, fontSize: '10px', color: '#484f58', lineHeight: 1.4 }}>
                {badge.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/**
 * Checks which badges should be unlocked given current counts.
 * Returns array of newly unlocked badge IDs.
 */
export function checkNewBadges({ saveCount, appCount, hasAccepted, speedDemon, currentBadges = [] }) {
  const earned = new Set(currentBadges)
  const newlyEarned = []

  const check = (id, condition) => {
    if (condition && !earned.has(id)) newlyEarned.push(id)
  }

  check('first_save', saveCount >= 1)
  check('collector', saveCount >= 5)
  check('explorer', saveCount >= 10)
  check('applied', appCount >= 1)
  check('applicant', appCount >= 5)
  check('winner', hasAccepted)
  check('speed_demon', speedDemon)

  return newlyEarned
}