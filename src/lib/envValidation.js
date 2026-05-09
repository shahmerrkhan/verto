export function validateEnv() {
  const required = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
  ]
  
  const missing = required.filter(key => !import.meta.env[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(', ')}`)
  }
  
  // Validate format
  const url = import.meta.env.VITE_SUPABASE_URL
  if (!url.includes('supabase.co')) {
    throw new Error('Invalid Supabase URL format')
  }
  
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (key.length < 20) {
    throw new Error('Invalid Supabase anon key format')
  }
  
  return true
}