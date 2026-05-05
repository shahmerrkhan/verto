import { getMatchTier } from '../lib/opportunityMatcher'

export default function MatchScore({ score, compact = false }) {
  if (score === null || score === undefined) return null

  const tier = getMatchTier(score)

  if (compact) {
    return (
      <span
        title={`${score}% match — ${tier.label}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '700',
          backgroundColor: tier.bg,
          color: tier.color,
          border: `1px solid ${tier.border}`,
          letterSpacing: '0.2px',
          whiteSpace: 'nowrap',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {tier.emoji} {score}%
      </span>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 10px',
        borderRadius: '8px',
        backgroundColor: tier.bg,
        border: `1px solid ${tier.border}`,
      }}
    >
      <span style={{ fontSize: '13px' }}>{tier.emoji}</span>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
          <span style={{ fontSize: '11px', fontWeight: '700', color: tier.color, letterSpacing: '0.2px' }}>
            {tier.label}
          </span>
          <span style={{ fontSize: '11px', fontWeight: '800', color: tier.color }}>
            {score}%
          </span>
        </div>
        <div
          style={{
            height: '3px',
            borderRadius: '99px',
            backgroundColor: 'rgba(255,255,255,0.08)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${score}%`,
              borderRadius: '99px',
              backgroundColor: tier.color,
              transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}