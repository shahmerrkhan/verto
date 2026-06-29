import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, opportunityId } = req.body

  if (!userId || !opportunityId) return res.status(400).json({ error: 'Missing fields' })

  try {
    await sql`
      INSERT INTO opportunity_views (user_id, opportunity_id)
      VALUES (${userId}, ${opportunityId})
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}