import sql from '../db.js'

export default async function handler(req, res) {
  const { type, tags, userId } = req.query
  const oppType = (type || '').toLowerCase()
  const oppTags = tags ? tags.split(',').map(t => t.toLowerCase()).filter(Boolean) : []

  try {
    const sessions = await sql`
      SELECT s.*, m.full_name AS mentor_full_name, m.role AS mentor_role,
             m.institution AS mentor_institution, m.linkedin_url AS mentor_linkedin_url
      FROM sessions s
      LEFT JOIN mentors m ON m.id = s.mentor_id
      WHERE s.is_active = true AND s.session_date >= NOW()
      ORDER BY s.session_date ASC
    `

    const matched = sessions
      .filter(session => {
        const sessionTags = (session.interest_tags || []).map(t => t.toLowerCase())
        const sessionTypes = (session.opportunity_types || []).map(t => t.toLowerCase())
        const tagMatch = sessionTags.some(t => oppTags.includes(t))
        const typeMatch = sessionTypes.includes(oppType)
        return tagMatch || typeMatch
      })
      .slice(0, 3)
      .map(s => ({
        ...s,
        mentors: s.mentor_full_name
          ? { full_name: s.mentor_full_name, role: s.mentor_role, institution: s.mentor_institution, linkedin_url: s.mentor_linkedin_url }
          : null,
      }))

    let signedUp = {}
    if (userId && matched.length > 0) {
      const ids = matched.map(s => s.id)
      const signups = await sql`
        SELECT session_id FROM session_signups
        WHERE user_id = ${userId} AND session_id = ANY(${ids})
      `
      signups.forEach(s => { signedUp[s.session_id] = true })
    }

    return res.status(200).json({ sessions: matched, signedUp })
  } catch (err) {
    console.error('upcoming sessions error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}