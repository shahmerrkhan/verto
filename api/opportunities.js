import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
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