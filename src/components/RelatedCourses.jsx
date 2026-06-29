import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CourseCard from './CourseCard'

const PLATFORM_LOGOS = {
  coursera: '🎓', edx: '📚', udemy: '👨‍💼',
  skillshare: '🎨', codecademy: '💻', other: '🌐',
  youtube: '▶️', duolingo: '🦉', educative: '📖',
  free: '🌐',
}

function scoreCourseFit(course, opportunity) {
  let score = 0

  const oppText = [
    opportunity.title || '',
    opportunity.description || '',
    opportunity.eligibility_notes || '',
    ...(Array.isArray(opportunity.interest_tags) ? opportunity.interest_tags : (opportunity.interest_tags || '').split(',')),
    opportunity.type || '',
  ].join(' ').toLowerCase()

  const courseText = [
    course.title || '',
    course.description || '',
    course.topic || '',
    course.provider || '',
  ].join(' ').toLowerCase()

  // Topic direct match
  if (course.topic && oppText.includes(course.topic.toLowerCase())) score += 40

  // Keyword overlap between course and opportunity
  const courseWords = courseText.split(/\W+/).filter(w => w.length > 4)
  const oppWords = oppText.split(/\W+/).filter(w => w.length > 4)
  const overlap = courseWords.filter(w => oppWords.includes(w)).length
  score += Math.min(overlap * 5, 30)

  // Type-based boosts
  const type = (opportunity.type || '').toLowerCase()
  const topic = (course.topic || '').toLowerCase()

  if (type === 'competition') {
    if (['mathematics', 'computer science', 'science & research', 'engineering', 'writing & journalism'].includes(topic)) score += 15
  }
  if (type === 'scholarship') {
    if (['personal finance', 'writing & journalism', 'economics', 'education'].includes(topic)) score += 10
  }
  if (type === 'internship' || type === 'program') {
    if (['software & tech', 'business & entrepreneurship', 'design', 'cybersecurity', 'data science'].includes(topic)) score += 15
  }

  return score
}

export default function RelatedCourses({ opportunity }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (opportunity) fetchAndMatch()
  }, [opportunity?.id])

  async function fetchAndMatch() {
    setLoading(true)

    // Pull a reasonable sample to score against — not all 594
    const res = await fetch('/api/courses')
    const data = await res.json()
    if (!Array.isArray(data)) { setLoading(false); return }

    const scored = data
      .map(c => ({ ...c, _score: scoreCourseFit(c, opportunity) }))
      .filter(c => c._score > 0)
      .sort((a, b) => b._score - a._score)
      .slice(0, 3)

    setCourses(scored)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', gap: '12px' }}>
      {[1, 2, 3].map(i => (
        <div key={i} style={{ flex: 1, height: '180px', backgroundColor: '#161b22', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', animation: 'pulse 1.5s ease-in-out infinite' }} />
      ))}
    </div>
  )

  if (courses.length === 0) return null

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 3px', fontFamily: "'Syne', sans-serif" }}>
            📚 Courses that help you win this
          </h3>
          <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>
            Build the skills this opportunity looks for
          </p>
        </div>
        <button
          onClick={() => navigate('/courses')}
          style={{ fontSize: '12px', fontWeight: '600', color: '#f59e0b', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
        >
          See all courses →
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))', gap: '12px' }}>
        {courses.map(course => (
          <CourseCard
            key={course.id}
            course={course}
            platformLogo={PLATFORM_LOGOS[course.platform?.toLowerCase()] || '🌐'}
          />
        ))}
      </div>
    </div>
  )
}