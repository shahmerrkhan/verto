import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas } from './_validate.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
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

export default withLogging(handler)
