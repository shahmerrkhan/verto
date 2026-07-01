import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { validate, schemas } from './_validate.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
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

export default withLogging(handler)
