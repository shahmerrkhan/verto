import { useNavigate } from 'react-router-dom'

export default function ProfileCompletion({ profile }) {
  const navigate = useNavigate()

  const fields = [
    { key: 'full_name', label: 'Full name', completed: !!profile?.full_name },
    { key: 'grade', label: 'Grade', completed: !!profile?.grade },
    { key: 'province', label: 'Province', completed: !!profile?.province },
    { key: 'interests', label: 'Interests', completed: profile?.interests?.length > 0 },
    { key: 'gpa_range', label: 'GPA', completed: !!profile?.gpa_range },
    { key: 'financial_need', label: 'Financial need', completed: !!profile?.financial_need },
  ]

  const completed = fields.filter(f => f.completed).length
  const percentage = Math.round((completed / fields.length) * 100)
  if (percentage === 100) return null

  return (
    <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px', padding: '16px 20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3' }}>Complete your profile</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '700' }}>{percentage}%</span>
          <button
            onClick={() => navigate('/profile')}
            style={{ padding: '5px 12px', borderRadius: '6px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '11px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            Fix now →
          </button>
        </div>
      </div>
      <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginBottom: '14px' }}>
        <div style={{ height: '100%', width: `${percentage}%`, backgroundColor: '#f59e0b', borderRadius: '2px', transition: 'width 0.4s ease' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
        {fields.map(field => (
          <div key={field.key} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <span style={{ width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', backgroundColor: field.completed ? 'rgba(63,185,80,0.15)' : 'rgba(255,255,255,0.05)', color: field.completed ? '#3fb950' : '#484f58', flexShrink: 0, border: field.completed ? '1px solid rgba(63,185,80,0.3)' : '1px solid rgba(255,255,255,0.08)' }}>
              {field.completed ? '✓' : ''}
            </span>
            <span style={{ fontSize: '12px', color: field.completed ? '#484f58' : '#7d8590', textDecoration: field.completed ? 'line-through' : 'none' }}>{field.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}