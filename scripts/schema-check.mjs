import { neon } from '@neondatabase/serverless'
const sql = neon(process.env.NEON_DATABASE_URL)

const tables = ['save_metadata', 'winners', 'mentors', 'articles']
let output = ''

for (const table of tables) {
  const cols = await sql`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = ${table}
    ORDER BY ordinal_position
  `
  output += `=== ${table} ===\n`
  for (const c of cols) output += `${c.column_name} | ${c.data_type} | nullable: ${c.is_nullable}\n`
  output += '\n'
}

console.log(output)
