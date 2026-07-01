import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  try {
    const rows = await sql`
    SELECT id, display_name, school, outcome, outcome_note, prize_amount, opportunity_title, org_name, won_at FROM winners ORDER BY won_at DESC
    `
    return res.status(200).json({ data: rows })
  } catch (err) {
    return handleError(res, err, 'winners fetch error:')
  }
}

export default withLogging(handler)
