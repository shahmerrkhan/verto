import { handleError } from './_error.js'
import sql from './db.js'

export default async function handler(req, res) {
  const { q } = req.query
  if (!q) return res.status(400).json({ error: 'Missing query' })
  const like = `%${q}%`

  try {
    const [opportunities, courses, articles, research] = await Promise.all([
      sql`
        SELECT id, title, org_name, type FROM opportunities
        WHERE is_active = true AND (title ILIKE ${like} OR org_name ILIKE ${like} OR description ILIKE ${like})
        LIMIT 4
      `,
      sql`
        SELECT id, title, provider, platform FROM courses
        WHERE is_active = true AND (title ILIKE ${like} OR provider ILIKE ${like} OR description ILIKE ${like})
        LIMIT 3
      `,
      sql`
        SELECT id, title, author_name FROM articles
        WHERE status = 'published' AND (title ILIKE ${like} OR excerpt ILIKE ${like} OR author_name ILIKE ${like})
        LIMIT 3
      `,
      sql`
        SELECT id, title, authors, field FROM research_papers
        WHERE title ILIKE ${like} OR authors ILIKE ${like} OR abstract ILIKE ${like}
        LIMIT 3
      `,
    ])
    return res.status(200).json({ opportunities, courses, articles, research })
  } catch (err) {
    return handleError(res, err, 'search error:')
  }
}
