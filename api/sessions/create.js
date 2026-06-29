import sql from '../db.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  const { mentor_id, title, session_date, meeting_link, duration_minutes, max_attendees, ...rest } = req.body
  try {
    await sql`
      INSERT INTO sessions (mentor_id, title, session_date, meeting_link, duration_minutes, max_attendees)
      VALUES (${mentor_id}, ${title}, ${session_date}, ${meeting_link}, ${duration_minutes}, ${max_attendees})
    `
    return res.status(200).json({ success: true })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}