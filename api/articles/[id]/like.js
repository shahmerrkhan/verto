import sql from '../../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.query
  const { userId, liked } = req.body

  try {
    if (liked) {
      await sql`DELETE FROM article_likes WHERE user_id = ${userId} AND article_id = ${id}`
    } else {
      await sql`INSERT INTO article_likes (user_id, article_id) VALUES (${userId}, ${id})`
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('article like error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}