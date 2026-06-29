import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, opportunityId, notes } = req.body
  try {
    await sql`
      INSERT INTO applications (user_id, opportunity_id, applied_at)
      VALUES (${userId}, ${opportunityId}, NOW())
      ON CONFLICT (user_id, opportunity_id) DO NOTHING
    `
    await sql`
      INSERT INTO save_metadata (user_id, opportunity_id, is_applied, outcome, notes)
      VALUES (${userId}, ${opportunityId}, true, 'pending', ${notes || null})
      ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
        is_applied = true, outcome = 'pending', notes = ${notes || null}
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('apply error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}