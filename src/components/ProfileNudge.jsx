import { useNavigate } from 'react-router-dom'

export default function ProfileNudge({ profile }) {
  const navigate = useNavigate()

  if (!profile) return null

  const missing = []
  if (!profile.full_name) missing.push('name')
  if (!profile.grade) missing.push('grade')
  if (!profile.province) missing.push('province')
  if (!profile.gpa_range) missing.push('GPA range')
  if (!profile.interests || profile.interests.length === 0) missing.push('interests')

  if (missing.length === 0) return null

  const pct = Math.round(((5 - missing.length) / 5) * 100)

  return (
    <div style={{
      backgroundColor: '#161b22',
      border: '1px solid rgba(245,158,11,0.25)',
      borderRadius: '14px',
      padding: '18px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3' }}>
            Your profile is {pct}% complete
          </span>
          <span style={{ fontSize: '11px', color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: '20px', fontWeight: '700', border: '1px solid rgba(245,158,11,0.2)' }}>
            {missing.length} field{missing.length > 1 ? 's' : ''} missing
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, backgroundColor: '#f59e0b', borderRadius: '2px', transition: 'width 0.3s' }} />
        </div>

        <p style={{ fontSize: '12px', color: '#7d8590', margin: 0 }}>
          Add your {missing.join(', ')} to get better matched opportunities.
        </p>
      </div>

      <button
        onClick={() => navigate('/profile')}
        style={{
          padding: '9px 18px', borderRadius: '8px', border: 'none',
          backgroundColor: '#f59e0b', color: '#0d1117',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer',
          fontFamily: 'inherit', flexShrink: 0, whiteSpace: 'nowrap',
        }}
      >
        Complete profile →
      </button>
    </div>
  )
}