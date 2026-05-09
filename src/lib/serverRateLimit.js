import { supabase } from './supabase'

const FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/rate-limiter`

export async function checkServerRateLimit(action) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return { allowed: true }

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ action }),
    })

    const result = await response.json()

    if (response.status === 429) {
      return {
        allowed: false,
        retryAfter: Math.ceil((result.retryAfter || 60000) / 1000),
      }
    }

    return { allowed: true }
  } catch (err) {
    // If the function is unreachable, fail open (don't block the user)
    console.warn('Rate limit check failed:', err)
    return { allowed: true }
  }
}