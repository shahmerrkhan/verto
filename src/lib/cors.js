// Frontend can't set CORS headers, but can check them
export function validateCorsHeaders(response) {
  const allowOrigin = response.headers.get('Access-Control-Allow-Origin')
  const allowMethods = response.headers.get('Access-Control-Allow-Methods')
  
  const isAllowed = allowOrigin === window.location.origin || allowOrigin === '*'
  
  if (!isAllowed) {
    console.error('CORS check failed:', allowOrigin)
    return false
  }
  
  return true
}

// For Supabase, CORS is already configured server-side, but validate anyway