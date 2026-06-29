import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM courses WHERE is_active = true ORDER BY created_at DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    console.error('courses fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}