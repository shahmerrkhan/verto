import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, badges } = req.body

  try {
    await sql`UPDATE profiles SET badges = ${JSON.stringify(badges)}::jsonb WHERE id = ${userId}`
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('badges update error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}