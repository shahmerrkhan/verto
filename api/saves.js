import { handleError, withLogging } from './_error.js'
import sql from './_db.js'
import { requireAuth } from './_auth.js'
import { applyCors } from './_cors.js'
import { validate, schemas } from './_validate.js'

async function handler(req, res) {
  if (applyCors(req, res)) return
  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return
  const { action } = req.query

  // ---- metadata (save_metadata table) ----
  if (action === 'metadata') {
    if (req.method === 'GET') {
      try {
        const data = await sql`SELECT * FROM save_metadata WHERE user_id = ${verifiedUserId}`
        return res.status(200).json({ data })
      } catch (err) {
        return handleError(res, err, 'save_metadata get error:')
      }
    }
    if (req.method === 'POST') {
      const { opportunityId, updates } = req.body
      const {
        notes = null, application_status = null, status_updated_at = null,
        is_archived = null, outcome = null,
      } = updates
      try {
        const [row] = await sql`
          INSERT INTO save_metadata (user_id, opportunity_id, notes, application_status, status_updated_at, is_archived, outcome)
          VALUES (${verifiedUserId}, ${opportunityId}, ${notes}, ${application_status}, ${status_updated_at}, ${is_archived}, ${outcome})
          ON CONFLICT (user_id, opportunity_id) DO UPDATE SET
            notes = COALESCE(EXCLUDED.notes, save_metadata.notes),
            application_status = COALESCE(EXCLUDED.application_status, save_metadata.application_status),
            status_updated_at = COALESCE(EXCLUDED.status_updated_at, save_metadata.status_updated_at),
            is_archived = COALESCE(EXCLUDED.is_archived, save_metadata.is_archived),
            outcome = COALESCE(EXCLUDED.outcome, save_metadata.outcome)
          RETURNING *
        `
        return res.status(200).json({ data: row })
      } catch (err) {
        return handleError(res, err, 'save_metadata update error:')
      }
    }
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ---- views (opportunity_views table) ----
  if (action === 'views') {
    if (req.method === 'GET') {
      try {
        const rows = await sql`SELECT opportunity_id, created_at FROM opportunity_views WHERE user_id = ${verifiedUserId}`
        return res.status(200).json({ data: rows })
      } catch (err) {
        return handleError(res, err, 'views get error:')
      }
    }
    if (req.method === 'POST') {
      const { opportunityId } = req.body
      if (!opportunityId) return res.status(400).json({ error: 'Missing fields' })
      try {
        const [row] = await sql`
          INSERT INTO opportunity_views (user_id, opportunity_id)
          VALUES (${verifiedUserId}, ${opportunityId})
          RETURNING *
        `
        return res.status(200).json({ data: row })
      } catch (err) {
        return handleError(res, err, 'views insert error:')
      }
    }
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ---- collections (collections table) ----
  if (action === 'collections') {
    if (req.method === 'GET') {
      try {
        const data = await sql`SELECT id, name, created_at FROM collections WHERE user_id = ${verifiedUserId} AND deleted_at IS NULL ORDER BY created_at ASC`
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
        await sql`UPDATE collections SET deleted_at = NOW() WHERE id = ${collectionId} AND user_id = ${verifiedUserId}`
        return res.status(200).json({ data: { deleted: true } })
      } catch (err) {
        return handleError(res, err, 'collections delete error:')
      }
    }
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // ---- opportunity-collections (opportunity_collections table) ----
  if (action === 'opportunity-collections') {
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

  // ---- default: saves table (no action param) ----
  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT opportunity_id FROM saves WHERE user_id = ${verifiedUserId}`
      return res.status(200).json({ data: rows.map(r => r.opportunity_id) })
    } catch (err) {
      return handleError(res, err, 'saves get error:')
    }
  }

  if (req.method === 'POST') {
    const { opportunityId } = req.body
    try {
      const [row] = await sql`
        INSERT INTO saves (user_id, opportunity_id) VALUES (${verifiedUserId}, ${opportunityId})
        ON CONFLICT DO NOTHING RETURNING *
      `
      return res.status(200).json({ data: row || null })
    } catch (err) {
      return handleError(res, err, 'saves insert error:')
    }
  }

  if (req.method === 'DELETE') {
    const { opportunityId } = req.body
    try {
      await sql`DELETE FROM saves WHERE user_id = ${verifiedUserId} AND opportunity_id = ${opportunityId}`
      return res.status(200).json({ data: { deleted: true } })
    } catch (err) {
      return handleError(res, err, 'saves delete error:')
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

export default withLogging(handler)