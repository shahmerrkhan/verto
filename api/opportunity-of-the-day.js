import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT id, title, org_name, type, deadline, amount, description
      FROM opportunities WHERE is_active = true
      ORDER BY created_at DESC LIMIT 20
    `
    if (!rows.length) return res.status(200).json({})
    const dayIndex = Math.floor(Date.now() / 86400000) % rows.length
    return res.status(200).json(rows[dayIndex])
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}