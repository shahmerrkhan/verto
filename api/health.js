import sql from './_db.js'
import { applyCors } from './_cors.js'
import { withLogging } from './_error.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  try {
    await sql`SELECT 1`
    return res.status(200).json({ status: 'ok' })
  } catch (err) {
    console.error('health check failed:', err)
    return res.status(500).json({ status: 'error' })
  }
}

export default withLogging(handler)