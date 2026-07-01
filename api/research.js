import { handleError } from './_error.js'
import sql from './db.js'

export default async function handler(req, res) {
  try {
    const rows = await sql`
      SELECT * FROM research_papers ORDER BY year DESC
    `
    return res.status(200).json(rows)
  } catch (err) {
    return handleError(res, err, 'research fetch error:')
  }
}
