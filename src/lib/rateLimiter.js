const operationCounts = {}

export function createRateLimiter(maxOperations = 10, windowMs = 60000) {
  return {
    check: (key) => {
      const now = Date.now()

      if (!operationCounts[key]) {
        operationCounts[key] = { count: 1, resetAt: now + windowMs }
        return { allowed: true, remaining: maxOperations - 1 }
      }

      const entry = operationCounts[key]

      if (now > entry.resetAt) {
        entry.count = 1
        entry.resetAt = now + windowMs
        return { allowed: true, remaining: maxOperations - 1 }
      }

      if (entry.count >= maxOperations) {
        return { allowed: false, remaining: 0, retryAfter: entry.resetAt - now }
      }

      entry.count++
      return { allowed: true, remaining: maxOperations - entry.count }
    }
  }
}

export const saveLimiter = createRateLimiter(20, 60000)
export const applicationLimiter = createRateLimiter(10, 60000)
export const noteLimiter = createRateLimiter(30, 60000)
export const searchLimiter = createRateLimiter(30, 60000)