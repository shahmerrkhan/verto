import { handleError } from './_error.js'
import sql from './db.js'

export default async function handler(req, res) {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const offset = (page - 1) * limit

    const [rows, countRows] = await Promise.all([
      sql`SELECT * FROM opportunities WHERE is_active = TRUE ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`,
      sql`SELECT COUNT(*) FROM opportunities WHERE is_active = TRUE`,
    ])

    return res.status(200).json({
      data: rows,
      total: Number(countRows[0].count),
      page,
      totalPages: Math.ceil(Number(countRows[0].count) / limit),
    })
  } catch (err) {
    return handleError(res, err, 'opportunities fetch error:')
  }
}
