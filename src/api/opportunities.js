import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM opportunities WHERE is_active = TRUE ORDER BY created_at DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    console.error('opportunities fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}