const operationCounts = {}

export function createRateLimiter(maxOperations = 10, windowMs = 60000) {
  return {
    check: (userId, operationKey) => {
      const key = `${userId}:${operationKey}`
      const now = Date.now()
      
      if (!operationCounts[key]) {
        operationCounts[key] = { count: 1, resetAt: now + windowMs }
        return { allowed: true, remaining: maxOperations - 1 }
      }
      
      const entry = operationCounts[key]
      
      // Reset window if expired
      if (now > entry.resetAt) {
        entry.count = 1
        entry.resetAt = now + windowMs
        return { allowed: true, remaining: maxOperations - 1 }
      }
      
      // Check limit
      if (entry.count >= maxOperations) {
        return { allowed: false, remaining: 0, retryAfter: entry.resetAt - now }
      }
      
      entry.count++
      return { allowed: true, remaining: maxOperations - entry.count }
    }
  }
}

// Create limiters for different operations
export const saveLimiter = createRateLimiter(20, 60000) // 20 saves per minute
export const applicationLimiter = createRateLimiter(10, 60000) // 10 applies per minute
export const noteLimiter = createRateLimiter(30, 60000) // 30 note updates per minute