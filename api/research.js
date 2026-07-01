import { handleError } from './_error.js'
import sql from './db.js'
import { applyCors } from './_cors.js'

export default async function handler(req, res) {
  if (applyCors(req, res)) return
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
  try {
    const rows = await sql`
    SELECT id, title, authors, abstract, field, year, doi, pdf_url, source_url FROM research_papers ORDER BY year DESC
    `
    return res.status(200).json({ data: rows })
  } catch (err) {
    return handleError(res, err, 'research fetch error:')
  }
}
