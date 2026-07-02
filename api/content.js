import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { applyCors } from './_cors.js'
import { validate, schemas } from './_validate.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action } = req.query

  // GET /api/content?action=courses
  if (action === 'courses') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    return res.status(200).json({ data: [] })
  }

  // GET /api/content?action=research
  if (action === 'research') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    try {
      const rows = await sql`SELECT id, title, authors, abstract, field, year, doi, pdf_url, source_url FROM research_papers ORDER BY year DESC`
      return res.status(200).json({ data: rows })
    } catch (err) {
      return handleError(res, err, 'research fetch error:')
    }
  }

  // GET /api/content?action=winners
  if (action === 'winners') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    try {
      const rows = await sql`SELECT id, display_name, school, outcome, outcome_note, prize_amount, opportunity_title, org_name, won_at FROM winners ORDER BY won_at DESC`
      return res.status(200).json({ data: rows })
    } catch (err) {
      return handleError(res, err, 'winners fetch error:')
    }
  }

  // POST /api/content?action=organizer-listing
  if (action === 'organizer-listing') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const body = validate(schemas.organizerListing, req.body, res)
    if (!body) return
    const { org_name, contact_name, contact_email, plan, notes, monthly_fee } = body
    try {
      const [row] = await sql`
        INSERT INTO organizer_listings (org_name, contact_name, contact_email, plan, notes, status, monthly_fee)
        VALUES (${org_name}, ${contact_name}, ${contact_email}, ${plan}, ${notes}, 'pending', ${monthly_fee})
        RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'organizer listing error:')
    }
  }

  return res.status(400).json({ error: 'Invalid action' })
}

export default withLogging(handler)