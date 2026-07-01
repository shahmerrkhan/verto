import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM opportunity_collections WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections get error:')
    }
  }

  if (req.method === 'POST') {
    const body = validate(schemas.opportunityCollection, req.body, res)
    if (!body) return
    const { opportunityId, collectionId } = body
    try {
      await sql`
        INSERT INTO opportunity_collections (user_id, opportunity_id, collection_id)
        VALUES (${verifiedUserId}, ${opportunityId}, ${collectionId})
        ON CONFLICT (opportunity_id, collection_id) DO NOTHING
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections add error:')
    }
  }

  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`DELETE FROM opportunity_collections WHERE user_id = ${verifiedUserId} AND opportunity_id = ${opportunityId}`
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections remove error:')
    }
  }

  return res.status(405).end()
}
