import sql from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id, status } = req.body
  try {
    await sql`UPDATE mentors SET status = ${status} WHERE id = ${id}`
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}