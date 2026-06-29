import sql from '../db.js'

export default async function handler(req, res) {
  const { id, userId } = req.query

  try {
    const [articleRows] = await sql`
      SELECT * FROM articles WHERE id = ${id} AND status = 'published'
    `
    if (!articleRows) return res.status(404).json({ error: 'Not found' })

    await sql`UPDATE articles SET views = views + 1 WHERE id = ${id}`

    let liked = false
    if (userId) {
      const likeRow = await sql`
        SELECT 1 FROM article_likes WHERE user_id = ${userId} AND article_id = ${id}
      `
      liked = likeRow.length > 0
    }

    const likeCountRows = await sql`
      SELECT COUNT(*) FROM article_likes WHERE article_id = ${id}
    `

    return res.status(200).json({
      article: articleRows,
      liked,
      likeCount: Number(likeCountRows[0].count),
    })
  } catch (err) {
    console.error('article fetch error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}