import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { requireAuth, requireAdmin } from './_auth.js'
import { logAudit } from './_audit.js'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas } from './_validate.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action, status, id, userId, type, tags } = req.query

  if (action === 'apply') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const allowed = await applyRateLimit(req, res)
    if (!allowed) return

    const body = validate(schemas.mentorApply, req.body, res)
    if (!body) return

    const { full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags } = body
    try {
      const [row] = await sql`
        INSERT INTO mentors (full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags, status)
        VALUES (${full_name}, ${email}, ${linkedin_url}, ${bio}, ${role}, ${institution}, ${skills}, ${opportunity_types}, ${interest_tags}, 'pending')
        RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'mentor apply error:')
    }
  }

  if (action === 'update-status') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' }) 
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    if (!(await requireAdmin(verifiedUserId, res))) return

    const { id: mentorId, status: newStatus } = req.body
    try {
      const [row] = await sql`UPDATE mentors SET status = ${newStatus} WHERE id = ${mentorId} RETURNING *`
      await logAudit(verifiedUserId, 'mentor-status-update', 'mentors', mentorId, { newStatus })
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'mentor status update error:')
    }
  }

  if (action === 'session-create') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
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

  if (action === 'session-signup') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
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

  if (action === 'session-upcoming') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
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

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const rows = status
      ? await sql`SELECT id, full_name, email, linkedin_url, bio, role, institution, skills, status FROM mentors WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT id, full_name, email, linkedin_url, bio, role, institution, skills, status FROM mentors ORDER BY created_at DESC`
    return res.status(200).json({ data: rows })
  } catch (err) {
    return handleError(res, err, 'mentors fetch error:')
  }
}

export default withLogging(handler)