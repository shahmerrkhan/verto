import { useEffect, useRef, useState } from 'react'

function getTimeLeft(deadline) {
  if (!deadline) return null
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return { expired: true, label: 'Closed', ms: 0 }

  const totalSeconds = Math.floor(diff / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
 
  let label
  if (days > 0) label = `${days}d ${hours}h left`
  else if (hours > 0) label = `${hours}h ${minutes}m left`
  else label = `${minutes}m left`

  return { expired: false, days, hours, minutes, label, ms: diff }
}

export default function DeadlineCountdown({ deadline, showToastOnDeadlineDay = false, onDeadlineToday }) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline))
  const toastFiredRef = useRef(false)

  useEffect(() => {
    if (!deadline) return

    const tick = () => {
      const t = getTimeLeft(deadline)
      setTimeLeft(t)

      // Fire toast callback once on deadline day
      if (
        t &&
        !t.expired &&
        t.days === 0 &&
        showToastOnDeadlineDay &&
        !toastFiredRef.current &&
        typeof onDeadlineToday === 'function'
      ) {
        toastFiredRef.current = true
        onDeadlineToday()
      }
    }

    tick()
    const interval = setInterval(tick, 60_000)
    return () => clearInterval(interval)
  }, [deadline])

  if (!timeLeft) return null
  if (timeLeft.expired) return (
    <span style={{ fontSize: '11px', fontWeight: '600', color: '#484f58', fontFamily: 'DM Sans, sans-serif' }}>
      Closed
    </span>
  )

  const isUrgent = timeLeft.days < 2
  const isSoon = timeLeft.days < 7

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '11px',
        fontWeight: '700',
        color: isUrgent ? '#f85149' : isSoon ? '#f59e0b' : '#7d8590',
        fontFamily: 'DM Sans, sans-serif',
        animation: isUrgent ? 'urgentPulse 1.8s ease-in-out infinite' : 'none',
      }}
    >
      ⏱ {timeLeft.label}
      <style>{`
        @keyframes urgentPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>
    </span>
  )
}
