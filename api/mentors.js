import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas } from './_validate.js'
import { applyCors } from './_cors.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action, status } = req.query

  // POST /api/mentors?action=apply
  if (action === 'apply' && req.method === 'POST') {
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

  // POST /api/mentors?action=update-status
  if (action === 'update-status' && req.method === 'POST') {
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    const [requester] = await sql`SELECT is_admin FROM profiles WHERE id = ${verifiedUserId}`
    if (!requester?.is_admin) return res.status(403).json({ error: 'Admin access required' })

    const { id, status: newStatus } = req.body
    try {
      const [row] = await sql`UPDATE mentors SET status = ${newStatus} WHERE id = ${id} RETURNING *`
      return res.status(200).json({ data: row })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // GET /api/mentors?status=X
  try {
    const rows = status
      ? await sql`SELECT id, full_name, email, linkedin_url, bio, role, institution, skills, status FROM mentors WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT id, full_name, email, linkedin_url, bio, role, institution, skills, status FROM mentors ORDER BY created_at DESC`
    return res.status(200).json({ data: rows })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}
