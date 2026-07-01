import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'

export default async function handler(req, res) {
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return
  const { action } = req.query

  // GET /api/applications?action=all (admin)
  if (action === 'all') {
    const [requester] = await sql`SELECT is_admin FROM profiles WHERE id = ${verifiedUserId}`
    if (!requester?.is_admin) {
      return res.status(403).json({ error: 'Admin access required' })
    }
    try {
      const rows = await sql`
        SELECT a.user_id, a.opportunity_id, a.applied_at, o.title, o.type
        FROM applications a
        LEFT JOIN opportunities o ON o.id = a.opportunity_id
        ORDER BY a.applied_at DESC
      `
      return res.status(200).json(rows)
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // POST /api/applications?action=apply  body: { opportunityId, notes }
  if (action === 'apply' && req.method === 'POST') {
    const { opportunityId, notes } = req.body
    try {
      await sql`
        INSERT INTO applications (user_id, opportunity_id, applied_at)
        VALUES (${verifiedUserId}, ${opportunityId}, NOW())
        ON CONFLICT (user_id, opportunity_id) DO NOTHING
      `
      await sql`
        INSERT INTO save_metadata (user_id, opportunity_id, is_applied, outcome, notes)
        VALUES (${verifiedUserId}, ${opportunityId}, true, 'pending', ${notes || null})
        ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
          is_applied = true, outcome = 'pending', notes = ${notes || null}
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'apply error:')
    }
  }

  // GET /api/applications?action=mine
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT opportunity_id FROM applications WHERE user_id = ${verifiedUserId}`
      return res.status(200).json(rows.map(r => r.opportunity_id))
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

 // POST /api/applications  body: { opportunityId }
  if (req.method === 'POST') {
    const { opportunityId } = req.body
    try {
      await sql`
        INSERT INTO applications (user_id, opportunity_id)
        VALUES (${verifiedUserId}, ${opportunityId})
        ON CONFLICT DO NOTHING
      `
      return res.status(200).json({ success: true })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
