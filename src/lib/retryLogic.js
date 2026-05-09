export async function retryWithBackoff(fn, maxRetries = 3, initialDelayMs = 1000) {
  let lastError
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      // Don't retry on auth errors or validation errors
      if (error.status === 401 || error.status === 403 || error.status === 400) {
        throw error
      }
      
      // Don't retry if it's the last attempt
      if (attempt === maxRetries) break
      
      // Exponential backoff: 1s, 2s, 4s
      const delayMs = initialDelayMs * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }
  
  throw lastError
}