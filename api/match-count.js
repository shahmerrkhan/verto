import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { calculateMatchScore } from './_lib/matcher.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  if (req.method !== 'POST') return res.status(405).end()
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

export default withLogging(handler)