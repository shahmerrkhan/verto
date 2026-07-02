import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { requireAuth, requireAdmin } from './_auth.js'
import { validate, schemas, sanitizeText, isValidUUID } from './_validate.js'
import { applyCors } from './_cors.js'
import { logAudit } from './_audit.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action, id, userId } = req.query

  // GET /api/articles?action=detail&id=X&userId=Y
  if (action === 'detail' && id) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    if (!isValidUUID(id)) return res.status(400).json({ error: 'Invalid id' })
  try {
      const rows = await sql`SELECT id, author_name, title, excerpt, content, views, published_at FROM articles WHERE id = ${id} AND status = 'published'`
      if (!rows.length) return res.status(404).json({ error: 'Not found' })

      await sql`UPDATE articles SET views = views + 1 WHERE id = ${id}`

      let liked = false
      if (userId) {
        const likeRow = await sql`SELECT 1 FROM article_likes WHERE user_id = ${userId} AND article_id = ${id}`
        liked = likeRow.length > 0
      }

      const likeCountRows = await sql`SELECT COUNT(*) FROM article_likes WHERE article_id = ${id}`

      return res.status(200).json({
        article: rows[0],
        liked,
        likeCount: Number(likeCountRows[0].count),
      })
    } catch (err) {
      return handleError(res, err, 'article fetch error:')
    }
  }

  // POST /api/articles?action=like&id=X
  if (action === 'like') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    const body = validate(schemas.articleLike, req.body, res)
    if (!body) return
    const { liked } = body
    try {
      if (liked) {
        await sql`DELETE FROM article_likes WHERE user_id = ${verifiedUserId} AND article_id = ${id}`
      } else {
        await sql`INSERT INTO article_likes (user_id, article_id) VALUES (${verifiedUserId}, ${id})`
      }
      return res.status(200).json({ data: { liked: !liked } })
    } catch (err) {
      return handleError(res, err, 'article like error:')
    }
  }

  // GET /api/articles?action=pending — admin only
  if (action === 'pending') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    if (!(await requireAdmin(verifiedUserId, res))) return
    try {
      const rows = await sql`SELECT id, author_name, title, excerpt, content, created_at FROM articles WHERE status = 'pending' ORDER BY created_at ASC`
      return res.status(200).json({ data: rows })
    } catch (err) {
      return handleError(res, err, 'articles pending error:')
    }
  }

  // POST /api/articles?action=moderate  body: { id, approve: bool }
  if (action === 'moderate') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    if (!(await requireAdmin(verifiedUserId, res))) return
    const { id: articleId, approve } = req.body
    if (!articleId) return res.status(400).json({ error: 'id is required' })
    const newStatus = approve ? 'published' : 'rejected'
    try {
      const [row] = await sql`
        UPDATE articles SET status = ${newStatus}, published_at = ${approve ? sql`NOW()` : null}
        WHERE id = ${articleId} RETURNING *
      `
      await logAudit(verifiedUserId, 'article-moderate', 'articles', articleId, { newStatus })
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'article moderate error:')
    }
  }

  // POST /api/articles?action=submit  body: { authorName, title, excerpt, content }
  if (action === 'submit') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    const body = validate(schemas.articleSubmit, req.body, res)
    if (!body) return
    const authorName = sanitizeText(body.authorName, 100)
    const { title, excerpt, content } = body
    if (!title?.trim() || !content?.trim()) {
      return res.status(400).json({ error: 'title and content are required' })
    }
    try {
      const [row] = await sql`
        INSERT INTO articles (author_id, author_name, title, excerpt, content, status, views, published_at)
        VALUES (${verifiedUserId}, ${authorName}, ${title}, ${excerpt || content.substring(0, 150)}, ${content}, 'pending', 0, NOW())
        RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'article submit error:')
    }
  }

  // GET /api/articles — all published
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      sql`SELECT id, author_name, title, excerpt, content, views, published_at FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) FROM articles WHERE status = 'published'`,
    ])

    return res.status(200).json({
      data: rows,
      total: Number(countRows[0].count),
      page,
      totalPages: Math.ceil(Number(countRows[0].count) / limit),
    })
  } catch (err) {
    return handleError(res, err, 'articles fetch error:')
  }
}

export default withLogging(handler)
