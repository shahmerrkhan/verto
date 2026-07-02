import sql from './api/db.js'
const rows = await sql`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'courses'`
console.log(rows)
