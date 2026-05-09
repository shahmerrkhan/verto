// Cache frequently accessed data
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

export function getCached(key) {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    cache.delete(key)
    return null
  }
  return entry.data
}

export function setCache(key, data, ttlMs = CACHE_TTL) {
  cache.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
  })
}

export function clearCache(pattern = null) {
  if (!pattern) {
    cache.clear()
    return
  }
  for (const [key] of cache) {
    if (key.includes(pattern)) cache.delete(key)
  }
}

// Use in dbHelpers like:
// export async function getOpportunities() {
//   const cached = getCached('opportunities')
//   if (cached) return { data: cached, error: null }
//   
//   const { data, error } = await supabase.from('opportunities').select('*').eq('is_active', true)
//   if (data) setCache('opportunities', data)
//   return { data, error }
// }