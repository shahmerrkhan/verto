import { createClient } from '@supabase/supabase-js'
import { clearOfflineDB } from './offlineSupport'
import { clearCache } from './queryOptimization'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  }
})

supabase.auth.onAuthStateChange(async (event) => {
  if (event === 'SIGNED_OUT') {
    clearCache()
    await clearOfflineDB()
  }
})