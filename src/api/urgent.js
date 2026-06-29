import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query
  try {
    const saves = await sql`
      SELECT opportunity_id FROM saves WHERE user_id = ${userId}
    `
    if (!saves.length) return res.status(200).json([])

    const ids = saves.map(s => s.opportunity_id)
    const now = new Date()
    const cutoff = new Date(Date.now() + 48 * 60 * 60 * 1000)

    const rows = await sql`
      SELECT id, title, deadline FROM opportunities
      WHERE id = ANY(${ids}) AND is_active = true
        AND deadline >= ${now.toISOString()} AND deadline <= ${cutoff.toISOString()}
      ORDER BY deadline ASC LIMIT 1
    `
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}