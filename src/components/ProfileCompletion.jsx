export default function ProfileCompletion({ profile }) {
  const fields = [
    { key: 'full_name', label: 'Full name', completed: !!profile?.full_name },
    { key: 'grade', label: 'Grade', completed: !!profile?.grade },
    { key: 'province', label: 'Province', completed: !!profile?.province },
    { key: 'interests', label: 'Interests', completed: profile?.interests?.length > 0 },
    { key: 'gpa_range', label: 'GPA', completed: !!profile?.gpa_range },
    { key: 'financial_need', label: 'Financial need', completed: !!profile?.financial_need },
  ]

  const completed = fields.filter(f => f.completed).length
  const total = fields.length
  const percentage = Math.round((completed / total) * 100)

  if (percentage === 100) return null

  return (
    <div style={styles.container} className="profileCompletion">
      <div style={styles.header}>
        <h3 style={styles.title}>Complete your profile</h3>
        <p style={styles.subtitle}>{percentage}% complete</p>
      </div>

      <div style={styles.progressBar}>
        <div style={{
          ...styles.progressFill,
          width: `${percentage}%`,
        }}></div>
      </div>

      <div style={styles.fields}>
        {fields.map(field => (
          <div key={field.key} style={styles.fieldRow}>
            <span style={{
              ...styles.checkbox,
              backgroundColor: field.completed ? '#16a34a' : '#e5e7eb',
              color: field.completed ? '#fff' : '#d1d5db',
            }}>
              {field.completed ? '✓' : '○'}
            </span>
            <span style={{
              ...styles.fieldLabel,
              color: field.completed ? '#888' : '#555',
              textDecoration: field.completed ? 'line-through' : 'none',
            }}>
              {field.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const styles = {
container: {
    backgroundColor: '#f0fdf4',
    border: '1.5px solid #bbf7d0',
    borderRadius: '14px',
    padding: '20px 24px',
    marginBottom: '28px',
    boxShadow: '0 1px 8px rgba(16,163,92,0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  title: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#166534',
    margin: 0,
  },
  subtitle: {
    fontSize: '13px',
    color: '#16a34a',
    margin: 0,
    fontWeight: '500',
  },
  progressBar: {
    height: '6px',
    backgroundColor: '#dcfce7',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#16a34a',
    transition: 'width 0.3s ease',
  },
  fields: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '12px',
  },
  fieldRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '13px',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: '600',
    flexShrink: 0,
  },
  fieldLabel: {
    fontSize: '13px',
  },
}