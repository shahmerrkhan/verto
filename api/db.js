import { handleError } from './_error.js'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.NEON_DATABASE_URL)

export default sql
