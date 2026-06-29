import sql from '../../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { id } = req.query
  const { userId, email, signedUp } = req.body

  try {
    if (signedUp) {
      await sql`
        DELETE FROM session_signups WHERE session_id = ${id} AND user_id = ${userId}
      `
    } else {
      const [profile] = await sql`SELECT full_name FROM profiles WHERE id = ${userId}`
      await sql`
        INSERT INTO session_signups (session_id, user_id, email, full_name)
        VALUES (${id}, ${userId}, ${email}, ${profile?.full_name || null})
      `
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('session signup error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}