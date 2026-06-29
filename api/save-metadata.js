import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM save_metadata WHERE user_id = ${userId}`
      return res.status(200).json({ data })
    } catch (err) {
      console.error('save-metadata get error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    const { opportunityId, updates } = req.body
    const {
      notes = null,
      application_status = null,
      status_updated_at = null,
      is_archived = null,
      outcome = null,
    } = updates

    try {
      const [row] = await sql`
        INSERT INTO save_metadata (user_id, opportunity_id, notes, application_status, status_updated_at, is_archived, outcome)
        VALUES (${userId}, ${opportunityId}, ${notes}, ${application_status}, ${status_updated_at}, ${is_archived}, ${outcome})
        ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
          notes = COALESCE(EXCLUDED.notes, save_metadata.notes),
          application_status = COALESCE(EXCLUDED.application_status, save_metadata.application_status),
          status_updated_at = COALESCE(EXCLUDED.status_updated_at, save_metadata.status_updated_at),
          is_archived = COALESCE(EXCLUDED.is_archived, save_metadata.is_archived),
          outcome = COALESCE(EXCLUDED.outcome, save_metadata.outcome)
        RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      console.error('save-metadata upsert error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).end()
}