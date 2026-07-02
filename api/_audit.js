import sql from './_db.js'

export async function logAudit(userId, action, targetTable, targetId, details = null) {
  try {
    await sql`
      INSERT INTO audit_log (user_id, action, target_table, target_id, details)
      VALUES (${userId}, ${action}, ${targetTable}, ${targetId}, ${details ? JSON.stringify(details) : null})
    `
  } catch (err) {
    console.error('audit log error:', err)
  }
}