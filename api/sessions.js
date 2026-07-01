import { handleError } from './_error.js'
import sql from './db.js'
import { applyCors } from './_cors.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action, id, userId, type, tags } = req.query

  // POST /api/sessions?action=create
  if (action === 'create' && req.method === 'POST') {
    const { mentor_id, title, session_date, meeting_link, duration_minutes, max_attendees } = req.body
    try {
      await sql`
        INSERT INTO sessions (mentor_id, title, session_date, meeting_link, duration_minutes, max_attendees)
        VALUES (${mentor_id}, ${title}, ${session_date}, ${meeting_link}, ${duration_minutes}, ${max_attendees})
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  // POST /api/sessions?action=signup&id=X  body: { userId, email, signedUp }
  if (action === 'signup' && req.method === 'POST') {
    const { userId: uid, email, signedUp } = req.body
    if (!id || !uid) return res.status(400).json({ error: 'id and userId are required' })
    try {
      if (signedUp) {
        await sql`DELETE FROM session_signups WHERE session_id = ${id} AND user_id = ${uid}`
      } else {
        const [profile] = await sql`SELECT full_name FROM profiles WHERE id = ${uid}`
        await sql`
          INSERT INTO session_signups (session_id, user_id, email, full_name)
          VALUES (${id}, ${uid}, ${email}, ${profile?.full_name || null})
        `
      }
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'session signup error:')
    }
  }

  // GET /api/sessions?action=upcoming&type=X&tags=X&userId=X
  if (action === 'upcoming') {
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
          return sessionTags.some(t => oppTags.includes(t)) || sessionTypes.includes(oppType)
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
      return handleError(res, err, 'upcoming sessions error:')
    }
  }

  return res.status(400).json({ error: 'Invalid action' })
}
