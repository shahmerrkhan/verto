export default function CourseCard({ course, platformLogo }) {
  const levelColors = {
    beginner: '#10b981',
    intermediate: '#f59e0b',
    advanced: '#ef4444'
  }

  const levelLabels = {
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced'
  }

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.platformBadge}>{platformLogo}</div>
        <span style={{ ...styles.levelBadge, backgroundColor: levelColors[course.skill_level] }}>
          {levelLabels[course.skill_level]}
        </span>
      </div>

      <h3 style={styles.title}>{course.title}</h3>
      <p style={styles.provider}>{course.provider}</p>
      <p style={styles.description}>{course.description}</p>

      <div style={styles.meta}>
        {course.duration_hours && <span style={styles.metaItem}>⏱ {course.duration_hours}h</span>}
        {course.topic && <span style={styles.metaItem}>{course.topic}</span>}
        {course.platform && <span style={styles.metaItem}>{course.platform}</span>}
      </div>

      <a href={course.url} target="_blank" rel="noopener noreferrer" style={styles.cta}>
        Explore course
      </a>
    </div>
  )
}

const styles = {
  card: {
    backgroundColor: '#fff',
    border: '1.5px solid #e5e7eb',
    borderRadius: '16px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    height: '100%',
    boxSizing: 'border-box',
    boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  platformBadge: { fontSize: '26px' },
  levelBadge: { color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  title: { fontSize: '15px', fontWeight: '700', color: '#0a0a0a', margin: '0', lineHeight: 1.35, letterSpacing: '-0.2px' },
  provider: { fontSize: '12px', color: '#9ca3af', margin: '0', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' },
  description: { fontSize: '13px', color: '#6b7280', margin: '0', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 },
  meta: { display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #f3f4f6' },
  metaItem: { fontSize: '11px', fontWeight: '600', color: '#6b7280', backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '6px' },
  cta: { display: 'block', padding: '11px 14px', backgroundColor: '#064e3b', color: '#fff', textDecoration: 'none', borderRadius: '10px', fontSize: '13px', fontWeight: '700', textAlign: 'center', transition: 'all 0.2s ease', marginTop: 'auto', letterSpacing: '-0.1px' },
}