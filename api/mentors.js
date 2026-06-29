import sql from './db.js'

export default async function handler(req, res) {
  const status = req.query?.status
  try {
    const rows = status
      ? await sql`SELECT * FROM mentors WHERE status = ${status} ORDER BY created_at DESC`
      : await sql`SELECT * FROM mentors ORDER BY created_at DESC`
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}