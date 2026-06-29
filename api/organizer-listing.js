import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { org_name, contact_name, contact_email, plan, notes, monthly_fee } = req.body
  try {
    await sql`
      INSERT INTO organizer_listings (org_name, contact_name, contact_email, plan, notes, status, monthly_fee)
      VALUES (${org_name}, ${contact_name}, ${contact_email}, ${plan}, ${notes}, 'pending', ${monthly_fee})
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('organizer listing error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}