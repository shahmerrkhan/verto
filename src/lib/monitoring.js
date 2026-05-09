const errorLog = []
const MAX_ERRORS = 100

export function logError(error, context) {
  const entry = {
    timestamp: new Date().toISOString(),
    message: error.message,
    context,
    stack: error.stack,
  }
  
  errorLog.push(entry)
  
  // Keep only last 100 errors
  if (errorLog.length > MAX_ERRORS) {
    errorLog.shift()
  }
  
  // Alert on critical errors
  if (error.message.includes('CRITICAL') || error.message.includes('FATAL')) {
    sendAlert(entry)
  }
}

export function sendAlert(error) {
  // Send to your error tracking service (Sentry, LogRocket, etc)
  console.error('🚨 CRITICAL ERROR:', error)
  
  // In production, send to your backend:
  // fetch('/api/errors', { method: 'POST', body: JSON.stringify(error) })
}

export function getErrorLog() {
  return errorLog
}

export function clearErrorLog() {
  errorLog.length = 0
}