import { handleError } from './_error.js'
import sql from './db.js'
import { getAuth } from '@clerk/nextjs/server'
import { applyRateLimit } from './_ratelimit.js'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const allowed = await applyRateLimit(req, res)
  if (!allowed) return

  const { userId: verifiedUserId } = getAuth(req)
  if (!verifiedUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const body = validate(schemas.badge, req.body, res)
  if (!body) return
  const { badges } = body

  try {
    await sql`UPDATE profiles SET badges = ${JSON.stringify(badges)}::jsonb WHERE id = ${verifiedUserId}`
    return res.status(200).json({ success: true })
  } catch (err) {
    return handleError(res, err, 'badges update error:')
  }
}
