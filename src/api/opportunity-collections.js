import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM opportunity_collections WHERE user_id = ${userId}`
      return res.status(200).json({ data })
    } catch (err) {
      console.error('opportunity-collections get error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    const { opportunityId, collectionId } = req.body
    try {
      await sql`
        INSERT INTO opportunity_collections (user_id, opportunity_id, collection_id)
        VALUES (${userId}, ${opportunityId}, ${collectionId})
        ON CONFLICT (opportunity_id, collection_id) DO NOTHING
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('opportunity-collections add error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`DELETE FROM opportunity_collections WHERE user_id = ${userId} AND opportunity_id = ${opportunityId}`
      return res.status(200).json({ success: true })
    } catch (err) {
      console.error('opportunity-collections remove error:', err)
      return res.status(500).json({ error: 'Database error' })
    }
  }

  return res.status(405).end()
}