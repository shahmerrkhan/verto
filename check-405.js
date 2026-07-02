const base = 'https://verto-indol.vercel.app/api'
const endpoints = [
  'applications', 'articles', 'badges', 'collections', 'courses', 'health',
  'match-count', 'mentors', 'opportunities', 'opportunity-collections',
  'organizer-listing', 'outcome', 'profile', 'research', 'saves', 'search',
  'sessions', 'views', 'winners'
]

for (const ep of endpoints) {
  try {
    const res = await fetch(`${base}/${ep}`, { method: 'PATCH' })
    console.log(`${ep.padEnd(28)} ${res.status}`)
  } catch (err) {
    console.log(`${ep.padEnd(28)} ERROR: ${err.message}`)
  }
}
