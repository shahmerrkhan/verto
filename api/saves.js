import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query

  if (!userId) return res.status(400).json({ error: 'userId is required' })

  if (req.method === 'GET') {
    try {
      const rows = await sql`
        SELECT opportunity_id FROM saves WHERE user_id = ${userId}
      `
      return res.status(200).json(rows.map(r => r.opportunity_id))
    } catch (err) {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    const { opportunityId } = req.body
    try {
      await sql`
        INSERT INTO saves (user_id, opportunity_id)
        VALUES (${userId}, ${opportunityId})
        ON CONFLICT DO NOTHING
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`
        DELETE FROM saves WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}