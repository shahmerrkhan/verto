import sql from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags } = req.body
  try {
    await sql`
      INSERT INTO mentors (full_name, email, linkedin_url, bio, role, institution, skills, opportunity_types, interest_tags, status)
      VALUES (${full_name}, ${email}, ${linkedin_url}, ${bio}, ${role}, ${institution}, ${skills}, ${opportunity_types}, ${interest_tags}, 'pending')
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('mentor apply error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}