import { withLogging } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT opportunity_id, created_at FROM opportunity_views WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data: rows })
    } catch {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { opportunityId } = req.body

  if (!opportunityId) return res.status(400).json({ error: 'Missing fields' })
  
  try {
    const [row] = await sql`
      INSERT INTO opportunity_views (user_id, opportunity_id)
      VALUES (${verifiedUserId}, ${opportunityId})
      RETURNING *
    `
    return res.status(200).json({ data: row })
  } catch {
    return res.status(500).json({ error: 'Database error' })
  }
}

export default withLogging(handler)
