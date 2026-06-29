import sql from './db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const {
    saveMetaId, outcome, note, isPublic, userId, opportunityId,
    displayName, school, prizeAmount, opportunityTitle, orgName,
  } = req.body

  try {
    await sql`
      UPDATE save_metadata
      SET outcome = ${outcome}, outcome_note = ${note}, outcome_date = NOW(), is_public_win = ${isPublic}
      WHERE id = ${saveMetaId}
    `

    if (isPublic) {
      try {
        await sql`
          INSERT INTO winners (user_id, opportunity_id, display_name, school, outcome, outcome_note, prize_amount, opportunity_title, org_name)
          VALUES (${userId}, ${opportunityId}, ${displayName}, ${school}, ${outcome}, ${note}, ${prizeAmount}, ${opportunityTitle}, ${orgName})
        `
      } catch (winErr) {
        if (winErr.code !== '23505') throw winErr
        // already submitted this win, ignore
      }
    }

    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('outcome save error:', err)
    return res.status(500).json({ error: 'Database error' })
  }
}