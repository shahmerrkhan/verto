const limits = new Map()

export function createRateLimiter(maxRequests = 10, windowMs = 60000) {
  return {
    check: (key) => {
      const now = Date.now()
      
      if (!limits.has(key)) {
        limits.set(key, { count: 1, resetAt: now + windowMs })
        return { allowed: true, remaining: maxRequests - 1 }
      }
      
      const entry = limits.get(key)
      
      if (now > entry.resetAt) {
        entry.count = 1
        entry.resetAt = now + windowMs
        return { allowed: true, remaining: maxRequests - 1 }
      }
      
      if (entry.count >= maxRequests) {
        return { allowed: false, remaining: 0, retryAfter: entry.resetAt - now }
      }
      
      entry.count++
      return { allowed: true, remaining: maxRequests - entry.count }
    }
  }
}

export const searchLimiter = createRateLimiter(30, 60000) // 30 searches per minute
export const saveLimiter = createRateLimiter(20, 60000) // 20 saves per minute
export const applicationLimiter = createRateLimiter(10, 60000) // 10 applies per minute