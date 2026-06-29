import sql from '../db.js'

export default async function handler(req, res) {
  const id = req.query.id

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM opportunities WHERE id = ${id}`
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: 'Database error' })
    }
  }

  if (req.method === 'POST') {
    const { title, org_name, url, ...rest } = req.body
    try {
      await sql`
        UPDATE opportunities SET
          title = ${title}, org_name = ${org_name}, url = ${url},
          description = ${rest.description || null},
          type = ${rest.type || 'scholarship'},
          deadline = ${rest.deadline || null},
          amount = ${rest.amount || null},
          requires_essay = ${rest.requires_essay || false},
          province_scope = ${rest.province_scope || ['ALL']},
          grade_scope = ${rest.grade_scope || [9,10,11,12]}
        WHERE id = ${id}
      `
      return res.status(200).json({ success: true })
    } catch (err) {
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).end()
}