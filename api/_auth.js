import { verifyToken } from '@clerk/backend'

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