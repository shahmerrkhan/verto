import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { requireAuth, requireAdmin } from './_auth.js'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas, sanitizeText } from './_validate.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const { action } = req.query

  if (action === 'counts') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
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

  if (action === 'update') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    const updates = req.body
    try {
      const rows = await sql`
        INSERT INTO profiles (id, full_name, email, grade, province, gpa_range, interests, financial_need, email_alerts, updated_at)
        VALUES (
          ${verifiedUserId}, ${updates.full_name ?? null}, ${updates.email ?? null}, ${updates.grade ?? null},
          ${updates.province ?? null}, ${updates.gpa_range ?? null}, ${JSON.stringify(updates.interests ?? [])},
          ${updates.financial_need ?? false}, ${updates.email_alerts ?? false}, NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          full_name = EXCLUDED.full_name, email = EXCLUDED.email, grade = EXCLUDED.grade,
          province = EXCLUDED.province, gpa_range = EXCLUDED.gpa_range, interests = EXCLUDED.interests,
          financial_need = EXCLUDED.financial_need, email_alerts = EXCLUDED.email_alerts, updated_at = NOW()
        RETURNING *
      `
      return res.status(200).json({ data: rows[0] })
    } catch (err) {
      return handleError(res, err, 'profile update error:')
    }
  }

  if (action === 'badges') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const allowed = await applyRateLimit(req, res)
    if (!allowed) return
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    const body = validate(schemas.badge, req.body, res)
    if (!body) return
    const { badges } = body
    try {
      const [row] = await sql`
        UPDATE profiles SET badges = ${JSON.stringify(badges)}::jsonb
        WHERE id = ${verifiedUserId}
        RETURNING badges
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'badges update error:')
    }
  }

  if (action === 'audit-log') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    if (!(await requireAdmin(verifiedUserId, res))) return
    try {
      const rows = await sql`SELECT id, user_id, action, target_table, target_id, details, created_at FROM audit_log ORDER BY created_at DESC LIMIT 200`
      return res.status(200).json({ data: rows })
    } catch (err) {
      return handleError(res, err, 'audit log error:')
    }
  }

  if (action === 'applications-all') {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    if (!(await requireAdmin(verifiedUserId, res))) return
    try {
      const rows = await sql`
        SELECT a.user_id, a.opportunity_id, a.applied_at, o.title, o.type
        FROM applications a
        LEFT JOIN opportunities o ON o.id = a.opportunity_id
        ORDER BY a.applied_at DESC
      `
      return res.status(200).json({ data: rows })
    } catch (err) {
      return handleError(res, err, 'applications-all error:')
    }
  }

  if (action === 'applications-apply') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    const { opportunityId, notes } = req.body
    try {
      const [applicationRow] = await sql.transaction([
        sql`
          INSERT INTO applications (user_id, opportunity_id, applied_at)
          VALUES (${verifiedUserId}, ${opportunityId}, NOW())
          ON CONFLICT (user_id, opportunity_id) DO NOTHING
          RETURNING *
        `,
        sql`
          INSERT INTO save_metadata (user_id, opportunity_id, is_applied, outcome, notes)
          VALUES (${verifiedUserId}, ${opportunityId}, true, 'pending', ${notes || null})
          ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
            is_applied = true, outcome = 'pending', notes = ${notes || null}
        `,
      ])
      return res.status(200).json({ data: applicationRow[0] || null })
    } catch (err) {
      return handleError(res, err, 'apply error:')
    }
  }

  if (action === 'applications') {
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return

    if (req.method === 'GET') {
      try {
        const rows = await sql`SELECT opportunity_id FROM applications WHERE user_id = ${verifiedUserId}`
        return res.status(200).json({ data: rows.map(r => r.opportunity_id) })
      } catch (err) {
        return handleError(res, err, 'applications fetch error:')
      }
    }

    if (req.method === 'POST') {
      const { opportunityId } = req.body
      try {
        const [row] = await sql`
          INSERT INTO applications (user_id, opportunity_id)
          VALUES (${verifiedUserId}, ${opportunityId})
          ON CONFLICT DO NOTHING RETURNING *
        `
        return res.status(200).json({ data: row || null })
      } catch (err) {
        return handleError(res, err, 'applications create error:')
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })
  }

  if (action === 'outcome') {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
    const verifiedUserId = await requireAuth(req, res)
    if (!verifiedUserId) return
    const body = validate(schemas.outcome, req.body, res)
    if (!body) return
    const { saveMetaId, outcome, note, isPublic, opportunityId, school, prizeAmount, opportunityTitle, orgName } = body
    const displayName = sanitizeText(body.displayName, 100)
    try {
      await sql`
        UPDATE save_metadata
        SET outcome = ${outcome}, outcome_note = ${note}, outcome_date = NOW(), is_public_win = ${isPublic}
        WHERE id = ${saveMetaId} AND user_id = ${verifiedUserId}
      `
      if (isPublic) {
        try {
          await sql`
            INSERT INTO winners (user_id, opportunity_id, display_name, school, outcome, outcome_note, prize_amount, opportunity_title, org_name)
            VALUES (${verifiedUserId}, ${opportunityId}, ${displayName}, ${school}, ${outcome}, ${note}, ${prizeAmount}, ${opportunityTitle}, ${orgName})
          `
        } catch (winErr) {
          if (winErr.code !== '23505') throw winErr
        }
      }
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'outcome save error:')
    }
  }

  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })
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