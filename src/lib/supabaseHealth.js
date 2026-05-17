import { supabase } from './supabase'

let lastHealthCheck = null
let isHealthy = true

export async function checkSupabaseHealth() {
  try {
    const now = Date.now()
    if (lastHealthCheck && now - lastHealthCheck < 30000) return isHealthy

    const { error } = await supabase.rpc('ping').single()
    isHealthy = !error
    lastHealthCheck = now
    return isHealthy
  } catch (err) {
    isHealthy = false
    return false
  }
}

export function isSupabaseHealthy() {
  return isHealthy
}

checkSupabaseHealth()
setInterval(() => checkSupabaseHealth(), 120000)