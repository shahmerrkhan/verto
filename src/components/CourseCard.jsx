export default function CourseCard({ course, platformLogo }) {
  const levelConfig = {
    beginner: { bg: 'rgba(63,185,80,0.1)', color: '#3fb950', border: 'rgba(63,185,80,0.2)', label: 'Beginner' },
    intermediate: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: 'rgba(245,158,11,0.2)', label: 'Intermediate' },
    advanced: { bg: 'rgba(248,81,73,0.1)', color: '#f85149', border: 'rgba(248,81,73,0.2)', label: 'Advanced' },
  }
  const lc = levelConfig[course.skill_level] || levelConfig.beginner

  return (
    <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '24px' }}>{platformLogo}</span>
        <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: lc.bg, color: lc.color, border: `1px solid ${lc.border}` }}>{lc.label}</span>
      </div>
      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: 0, lineHeight: 1.35, fontFamily: "'Syne', sans-serif" }}>{course.title}</h3>
      <p style={{ fontSize: '11px', color: '#484f58', margin: 0, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{course.provider}</p>
      <p style={{ fontSize: '13px', color: '#7d8590', margin: 0, lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>{course.description}</p>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {course.duration_hours && <span style={{ fontSize: '11px', fontWeight: '600', color: '#7d8590', backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>⏱ {course.duration_hours}h</span>}
        {course.topic && <span style={{ fontSize: '11px', fontWeight: '600', color: '#7d8590', backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>{course.topic}</span>}
        {course.platform && <span style={{ fontSize: '11px', fontWeight: '600', color: '#7d8590', backgroundColor: 'rgba(255,255,255,0.04)', padding: '3px 8px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>{course.platform}</span>}
      </div>
      <a href={course.url} target="_blank" rel="noopener noreferrer" style={{ display: 'block', padding: '10px 14px', backgroundColor: '#f59e0b', color: '#0d1117', textDecoration: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '700', textAlign: 'center', transition: 'all 0.2s ease', marginTop: 'auto', letterSpacing: '0.1px' }}
        onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fbbf24'; e.currentTarget.style.transform = 'translateY(-1px)' }}
        onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#f59e0b'; e.currentTarget.style.transform = 'translateY(0)' }}>
        Explore course →
      </a>
    </div>
  )
}