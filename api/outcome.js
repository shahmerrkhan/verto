import { handleError } from './_error.js'
import sql from './db.js'
import { requireAuth } from './_auth.js'
import { validate, schemas } from './_validate.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const verifiedUserId = await requireAuth(req, res)
  if (!verifiedUserId) return

  const body = validate(schemas.outcome, req.body, res)
  if (!body) return
  const { saveMetaId, outcome, note, isPublic, opportunityId, displayName, school, prizeAmount, opportunityTitle, orgName } = body

  try {
    await sql`
      UPDATE save_metadata
      SET outcome = ${outcome}, outcome_note = ${note}, outcome_date = NOW(), is_public_win = ${isPublic}
      WHERE id = ${saveMetaId} AND user_id = ${verifiedUserId}
    `

    if (isPublic) {
      try {
        await sql`
          INSERT INTO winners (user_id, opportunity_id, display_name, school, outcome, outcome_note, prize_amount, opportunity_title, org_name)
          VALUES (${verifiedUserId}, ${opportunityId}, ${displayName}, ${school}, ${outcome}, ${note}, ${prizeAmount}, ${opportunityTitle}, ${orgName})
        `
      } catch (winErr) {
        if (winErr.code !== '23505') throw winErr
        // already submitted this win, ignore
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    return handleError(res, err, 'outcome save error:')
  }
}
