import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.NEON_DATABASE_URL, {
  queryTimeout: 10000,
})

export default sql