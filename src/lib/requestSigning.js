// Sign requests to prevent CSRF
const SESSION_KEY = 'verto-session-token'

export function generateSessionToken() {
  const token = btoa(JSON.stringify({
    id: Math.random().toString(36).substr(2, 9),
    timestamp: Date.now(),
  }))
  sessionStorage.setItem(SESSION_KEY, token)
  return token
}

export function getSessionToken() {
  return sessionStorage.getItem(SESSION_KEY)
}

export function validateSessionToken(token) {
  const stored = getSessionToken()
  return token === stored
}

export function clearSessionToken() {
  sessionStorage.removeItem(SESSION_KEY)
}

// Initialize on app load
if (!getSessionToken()) {
  generateSessionToken()
}