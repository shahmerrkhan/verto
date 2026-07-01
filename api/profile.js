import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action } = req.query
  
  // GET /api/profile?action=counts&userId=X
  if (action === 'counts') {
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    try {
      const [[saves], [apps]] = await Promise.all([
        sql`SELECT COUNT(*) FROM saves WHERE user_id = ${verifiedUserId}`,
        sql`SELECT COUNT(*) FROM applications WHERE user_id = ${verifiedUserId}`,
      ])
      return res.status(200).json({ data: { saves: Number(saves.count), apps: Number(apps.count) } })
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
      return res.status(200).json({ data: rows[0] })
    } catch (err) {
      return handleError(res, err, 'profile update error:')
    }
  }

  // GET /api/profile?userId=X — default, fetch profile
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return

  try {
    const rows = await sql`SELECT id, full_name, email, grade, province, gpa_range, interests, financial_need, email_alerts, badges FROM profiles WHERE id = ${verifiedUserId} LIMIT 1`
    if (rows.length === 0) return res.status(404).json({ error: 'Profile not found' })
    return res.status(200).json({ data: rows[0] })
  } catch (err) {
    return handleError(res, err, 'profile fetch error:')
  }
}

export default withLogging(handler)
