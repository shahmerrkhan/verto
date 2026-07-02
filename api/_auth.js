import { verifyToken } from '@clerk/backend'
import sql from './_db.js'

export async function requireAuth(req, res) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Not authenticated' })
    return null
  }
  const token = authHeader.split(' ')[1]
  try {
    const { sub: userId } = await verifyToken(token, { secretKey: process.env.CLERK_SECRET_KEY })
    return userId
  } catch (err) {
    console.error('TOKEN VERIFY FAILED:', err.message)
    res.status(401).json({ error: 'Invalid session' })
    return null
  }
}

// Call after requireAuth. Returns true if admin, otherwise sends 403 and returns false.
export async function requireAdmin(userId, res) {
  const [requester] = await sql`SELECT is_admin FROM profiles WHERE id = ${userId}`
  if (!requester?.is_admin) {
    res.status(403).json({ error: 'Admin access required' })
    return false
  }
  return true
}