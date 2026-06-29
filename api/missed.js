import sql from './db.js'

export default async function handler(req, res) {
  const { userId } = req.query
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()

    const [opps, views] = await Promise.all([
      sql`
        SELECT id, title, org_name, type, deadline, amount
        FROM opportunities
        WHERE is_active = true AND created_at >= ${threeDaysAgo}
        ORDER BY created_at DESC LIMIT 12
      `,
      sql`
        SELECT opportunity_id FROM opportunity_views WHERE user_id = ${userId}
      `
    ])

    const seenIds = new Set(views.map(v => v.opportunity_id))
    const unseen = opps.filter(op => !seenIds.has(op.id)).slice(0, 4)
    return res.status(200).json(unseen)
  } catch (err) {
    return res.status(500).json({ error: 'Database error' })
  }
}