import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query

  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const rows = await sql`
      SELECT * FROM profiles WHERE id = ${userId} LIMIT 1
    `
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    return res.status(200).json(rows[0])
  } catch (err) {
    console.error('profile fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}