import sql from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { authorId, authorName, title, excerpt, content } = req.body
  try {
    await sql`
      INSERT INTO articles (author_id, author_name, title, excerpt, content, status, views)
      VALUES (${authorId}, ${authorName}, ${title}, ${excerpt}, ${content}, 'pending', 0)
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('article submit error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}