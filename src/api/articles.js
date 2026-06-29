import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM articles WHERE status = 'published' ORDER BY published_at DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    console.error('articles fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}