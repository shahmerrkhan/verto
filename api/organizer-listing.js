import { handleError } from './_error.js'
import sql from './db.js'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const body = validate(schemas.organizerListing, req.body, res)
  if (!body) return
  const { org_name, contact_name, contact_email, plan, notes, monthly_fee } = body
  try {
    await sql`
      INSERT INTO organizer_listings (org_name, contact_name, contact_email, plan, notes, status, monthly_fee)
      VALUES (${org_name}, ${contact_name}, ${contact_email}, ${plan}, ${notes}, 'pending', ${monthly_fee})
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    return handleError(res, err, 'organizer listing error:')
  }
}
