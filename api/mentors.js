import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  const { action, status } = req.query

  // POST /api/mentors?action=apply
  if (action === 'apply' && req.method === 'POST') {
    const allowed = await applyRateLimit(req, res)
    if (!allowed) return

    const body = validate(schemas.mentorApply, req.body, res)
    if (!body) return

    const { full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags } = body
    try {
      await sql`
        INSERT INTO mentors (full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags, status)
        VALUES (${full_name}, ${email}, ${linkedin_url}, ${bio}, ${role}, ${institution}, ${skills}, ${opportunity_types}, ${interest_tags}, 'pending')
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'mentor apply error:')
    }
  }

  // POST /api/mentors?action=update-status
  if (action === 'update-status' && req.method === 'POST') {
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    const [requester] = await sql`SELECT is_admin FROM profiles WHERE id = ${verifiedUserId}`
    if (!requester?.is_admin) return res.status(403).json({ error: 'Admin access required' })

    const { id, status: newStatus } = req.body
    try {
      await sql`UPDATE mentors SET status = ${newStatus} WHERE id = ${id}`
      return res.status(200).json({ success: true })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // GET /api/mentors?status=X
  try {
    const rows = status
      ? await sql`SELECT * FROM mentors WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM mentors ORDER BY created_at DESC`
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}
