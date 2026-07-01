import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'

export default async function handler(req, res) {
  const { action, userId } = req.query

  // GET /api/profile?action=counts&userId=X
  if (action === 'counts') {
    if (!userId) return res.status(400).json({ error: 'Missing userId' })
    try {
      const [[saves], [apps]] = await Promise.all([
        sql`SELECT COUNT(*) FROM saves WHERE user_id = ${userId}`,
        sql`SELECT COUNT(*) FROM applications WHERE user_id = ${userId}`,
      ])
      return res.status(200).json({ saves: Number(saves.count), apps: Number(apps.count) })
    } catch (err) {
      return handleError(res, err, 'profile counts error:')
    }
  }

  // POST /api/profile?action=update  body: { ...updates }
  if (action === 'update' && req.method === 'POST') {
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    const updates = req.body

    try {
      const rows = await sql`
        INSERT INTO profiles (id, full_name, email, grade, province, gpa_range, interests, financial_need, email_alerts, updated_at)
        VALUES (
          ${verifiedUserId},
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
      return handleError(res, err, 'profile update error:')
    }
  }

  // GET /api/profile?userId=X — default, fetch profile
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' })
  }

  try {
    const rows = await sql`SELECT * FROM profiles WHERE id = ${userId} LIMIT 1`
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    return res.status(200).json(rows[0])
  } catch (err) {
    return handleError(res, err, 'profile fetch error:')
  }
}
