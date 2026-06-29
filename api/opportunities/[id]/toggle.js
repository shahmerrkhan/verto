import sql from '../../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const id = req.query.id
  const { is_active } = req.body
  try {
    await sql`UPDATE opportunities SET is_active = ${is_active} WHERE id = ${id}`
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}