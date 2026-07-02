import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { applyCors } from './_cors.js'
import { calculateMatchScore } from './_lib/matcher.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action } = req.query

 // GET /api/opportunities?action=detail&id=X
  if (action === 'detail') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const oppId = Number(req.query.id)
    if (!oppId) return res.status(400).json({ error: 'id is required' })
    try {
      const [row] = await sql`
        SELECT id, title, description, type, category, org_name, amount, deadline, interest_tags, requires_essay, location, min_gpa, max_grade, min_grade, gpa_scope, grade_scope, province_scope, province, eligibility_notes, link, url, resources, created_at
        FROM opportunities WHERE id = ${oppId}
      `
      if (!row) return res.status(404).json({ error: 'Not found' })
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'opportunity detail error:')
    }
  }

  // POST /api/opportunities?action=match-count
  if (action === 'match-count') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const profile = req.body
    try {
      const opps = await sql`
        SELECT interest_tags, category, type, grade_scope, min_grade, max_grade, location, province_scope, amount, gpa_scope, min_gpa, requires_essay
        FROM opportunities WHERE is_active = TRUE
      `
      const matched = opps.filter(opp => calculateMatchScore(opp, profile) >= 30)
      return res.status(200).json({ count: matched.length })
    } catch (err) {
      return handleError(res, err, 'match-count error:')
    }
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
  try {
    if (req.query.ids) {
      const idList = req.query.ids.split(',').map(Number).filter(n => !isNaN(n))
      if (idList.length === 0) return res.status(200).json({ data: [] })
      const rows = await sql`
        SELECT id, title, description, type, category, org_name, amount, deadline, interest_tags, requires_essay, location, min_gpa, max_grade, min_grade, gpa_scope, grade_scope, province_scope, province, eligibility_notes, link, url, resources, created_at
        FROM opportunities WHERE id = ANY(${idList})
      `
      return res.status(200).json({ data: rows })
    }

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      sql`SELECT id, title, description, type, category, org_name, amount, deadline, interest_tags, requires_essay, location, min_gpa, max_grade, min_grade, gpa_scope, grade_scope, province_scope, province, eligibility_notes, link, url, resources, created_at FROM opportunities WHERE is_active = TRUE ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) FROM opportunities WHERE is_active = TRUE`,
    ])

    return res.status(200).json({
      data: rows,
      total: Number(countRows[0].count),
      page,
      totalPages: Math.ceil(Number(countRows[0].count) / limit),
    })
  } catch (err) {
    return handleError(res, err, 'opportunities fetch error:')
  }
}

export default withLogging(handler)