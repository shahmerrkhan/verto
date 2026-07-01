import { handleError } from './_error.js'
import sql from './db.js'
import { getAuth } from '@clerk/nextjs/server'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  const { userId: verifiedUserId } = getAuth(req)
  if (!verifiedUserId) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (req.method === 'GET') {
    try {
      const data = await sql`SELECT * FROM collections WHERE user_id = ${verifiedUserId} ORDER BY created_at ASC`
      return res.status(200).json({ data })
    } catch (err) {
      return handleError(res, err, 'collections get error:')
    }
  }

  if (req.method === 'POST') {
    const body = validate(schemas.collection, req.body, res)
  if (!body) return
  const { name } = body
    try {
      const [row] = await sql`
        INSERT INTO collections (user_id, name) VALUES (${verifiedUserId}, ${name}) RETURNING *
      `
      return res.status(200).json({ data: row })
    } catch (err) {
      return handleError(res, err, 'collections create error:')
    }
  }

  if (req.method === 'DELETE') {
    const { collectionId } = req.body
    try {
      await sql`DELETE FROM collections WHERE id = ${collectionId} AND user_id = ${verifiedUserId}`
      return res.status(200).json({ success: true })
    } catch (err) {
      return handleError(res, err, 'collections delete error:')
    }
  }

  return res.status(405).end()
}
