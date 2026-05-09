import { supabase } from './supabase'

let lastHealthCheck = null
let isHealthy = true

export async function checkSupabaseHealth() {
  try {
    const now = Date.now()
    // Only check every 30 seconds
    if (lastHealthCheck && now - lastHealthCheck < 30000) {
      return isHealthy
    }
    
    const { data, error } = await supabase.from('profiles').select('id').limit(1)
    
    if (error) {
      console.error('Supabase health check failed:', error)
      isHealthy = false
      return false
    }
    
    isHealthy = true
    lastHealthCheck = now
    return true
  } catch (err) {
    console.error('Health check error:', err)
    isHealthy = false
    return false
  }
}

export function isSupabaseHealthy() {
  return isHealthy
}

// Check health on app load
checkSupabaseHealth()

// Recheck every 2 minutes
setInterval(() => checkSupabaseHealth(), 120000)