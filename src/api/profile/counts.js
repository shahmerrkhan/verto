import sql from '../db.js'

export default async function handler(req, res) {
  const { userId } = req.query
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  try {
    const [[saves], [apps]] = await Promise.all([
      sql`SELECT COUNT(*) FROM saves WHERE user_id = ${userId}`,
      sql`SELECT COUNT(*) FROM applications WHERE user_id = ${userId}`,
    ])
    return res.status(200).json({ saves: Number(saves.count), apps: Number(apps.count) })
  } catch (err) {
    console.error('profile counts error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}