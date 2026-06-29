import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM research_papers ORDER BY year DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    console.error('research fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}