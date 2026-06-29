import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { userId, ...updates } = req.body

  if (!userId) return res.status(400).json({ error: 'userId is required' })

  try {
    const rows = await sql`
      INSERT INTO profiles (id, full_name, email, grade, province, gpa_range, interests, financial_need, email_alerts, updated_at)
      VALUES (
        ${userId},
        ${updates.full_name ?? null},
        ${updates.email ?? null},
        ${updates.grade ?? null},
        ${updates.province ?? null},
        ${updates.gpa_range ?? null},
        ${JSON.stringify(updates.interests ?? [])},
        ${updates.financial_need ?? false},
        ${updates.email_alerts ?? false},
        NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        grade = EXCLUDED.grade,
        province = EXCLUDED.province,
        gpa_range = EXCLUDED.gpa_range,
        interests = EXCLUDED.interests,
        financial_need = EXCLUDED.financial_need,
        email_alerts = EXCLUDED.email_alerts,
        updated_at = NOW()
      RETURNING *
    `
    return res.status(200).json(rows[0])
  } catch (err) {
    console.error('profile update error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}