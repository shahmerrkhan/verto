import { handleError, withLogging } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { validate, schemas } from './_validate.js'
import { applyCors } from './_cors.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT opportunity_id, collection_id FROM opportunity_collections WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections get error:')
    }
  }

  if (req.method === 'POST') {
    const body = validate(schemas.opportunityCollection, req.body, res)
    if (!body) return
    const { opportunityId, collectionId } = body

    const [owned] = await sql`SELECT id FROM collections WHERE id = ${collectionId} AND user_id = ${verifiedUserId}`
    if (!owned) return res.status(403).json({ error: 'Collection does not belong to you' })

    try {
      const [row] = await sql`
        INSERT INTO opportunity_collections (user_id, opportunity_id, collection_id)
        VALUES (${verifiedUserId}, ${opportunityId}, ${collectionId})
        ON CONFLICT (opportunity_id, collection_id) DO NOTHING
        RETURNING *
      `
      return res.status(200).json({ data: row || null })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections add error:')
    }
  }

  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`DELETE FROM opportunity_collections WHERE user_id = ${verifiedUserId} AND opportunity_id = ${opportunityId}`
      return res.status(200).json({ data: { deleted: true } })
    } catch (err) {
      return handleError(res, err, 'opportunity-collections remove error:')
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withLogging(handler)
