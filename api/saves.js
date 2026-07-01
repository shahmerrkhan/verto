import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyCors } from './_cors.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return
  const { action } = req.query

  // GET /api/saves?userId=X&action=metadata
  if (action === 'metadata') {
    try {
      const data = await sql`SELECT * FROM save_metadata WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // POST /api/saves?userId=X&action=metadata  body: { opportunityId, updates }
  if (action === 'metadata' && req.method === 'POST') {
    const { opportunityId, updates } = req.body
    const {
      notes = null, application_status = null, status_updated_at = null,
      is_archived = null, outcome = null,
    } = updates
    try {
      const [row] = await sql`
        INSERT INTO save_metadata (user_id, opportunity_id, notes, application_status, status_updated_at, is_archived, outcome)
        VALUES (${verifiedUserId}, ${opportunityId}, ${notes}, ${application_status}, ${status_updated_at}, ${is_archived}, ${outcome})
        ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
          notes = COALESCE(EXCLUDED.notes, save_metadata.notes),
          application_status = COALESCE(EXCLUDED.application_status, save_metadata.application_status),
          status_updated_at = COALESCE(EXCLUDED.status_updated_at, save_metadata.status_updated_at),
          is_archived = COALESCE(EXCLUDED.is_archived, save_metadata.is_archived),
          outcome = COALESCE(EXCLUDED.outcome, save_metadata.outcome)
        RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // GET /api/saves?userId=X
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT opportunity_id FROM saves WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data: rows.map(r => r.opportunity_id) })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  // POST /api/saves?userId=X  body: { opportunityId }
  if (req.method === 'POST') {
    const { opportunityId } = req.body
    try {
      const [row] = await sql`
        INSERT INTO saves (user_id, opportunity_id) VALUES (${verifiedUserId}, ${opportunityId})
        ON CONFLICT DO NOTHING RETURNING *
      `
      return res.status(200).json({ data: row || null })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }
  // DELETE /api/saves?userId=X  body: { opportunityId }
  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`DELETE FROM saves WHERE user_id = ${verifiedUserId} AND opportunity_id = ${opportunityId}`
      return res.status(200).json({ data: { deleted: true } })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
