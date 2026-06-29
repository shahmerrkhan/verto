import sql from './db.js'

export default async function handler(req, res) {
  const { type, exclude } = req.query
  try {
    const rows = await sql`
      SELECT id, title, org_name, type, deadline, amount
      FROM opportunities
      WHERE is_active = true AND type = ${type} AND id != ${parseInt(exclude)}
      LIMIT 3
    `
    return res.status(200).json(rows)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}