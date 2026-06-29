import sql from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { userId, full_name, grade, province, interests, gpa_range, financial_need } = req.body
  if (!userId) return res.status(400).json({ error: 'Missing userId' })

  try {
    await sql`
      UPDATE profiles SET
        full_name = ${full_name},
        grade = ${grade},
        province = ${province},
        interests = ${interests},
        gpa_range = ${gpa_range},
        financial_need = ${financial_need},
        updated_at = NOW()
      WHERE id = ${userId}
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('profile update error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}