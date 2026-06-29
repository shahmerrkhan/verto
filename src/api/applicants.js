import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT a.user_id, a.opportunity_id, a.applied_at, o.title, o.type
      FROM applications a
      LEFT JOIN opportunities o ON o.id = a.opportunity_id
      ORDER BY a.applied_at DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}