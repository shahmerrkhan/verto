import fs from 'fs'
import path from 'path'

const apiDir = path.join(process.cwd(), 'api')
const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.js') && !f.startsWith('_') && f !== 'db.js')

console.log('file'.padEnd(30), 'cors', 'logging')
console.log('-'.repeat(50))

for (const file of files) {
  const content = fs.readFileSync(path.join(apiDir, file), 'utf8')
  const hasCors = content.includes('applyCors')
  const hasLogging = content.includes('withLogging(handler)')
  console.log(file.padEnd(30), hasCors ? 'yes ' : 'NO  ', hasLogging ? 'yes' : 'NO')
}
