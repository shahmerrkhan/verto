import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM collections WHERE user_id = ${userId} ORDER BY created_at ASC`
      return res.status(200).json({ data })
    } catch (err) {
      console.error('collections get error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    const { name } = req.body
    try {
      const [row] = await sql`
        INSERT INTO collections (user_id, name) VALUES (${userId}, ${name}) RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      console.error('collections create error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'DELETE') {
    const { collectionId } = req.body
    try {
      await sql`DELETE FROM collections WHERE id = ${collectionId} AND user_id = ${userId}`
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('collections delete error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).end()
}