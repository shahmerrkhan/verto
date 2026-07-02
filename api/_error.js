import * as Sentry from '@sentry/node'

let initialized = false
function initSentry() {
  if (initialized || !process.env.SENTRY_DSN) return
  Sentry.init({ dsn: process.env.SENTRY_DSN, tracesSampleRate: 0.1 })
  initialized = true
}

export function logRequest(req, status, ms) {
  console.log(JSON.stringify({
    method: req.method, url: req.url, status, ms, timestamp: new Date().toISOString(),
  }))
  if (status >= 500) {
    initSentry()
    Sentry.captureMessage(`Slow/error response: ${req.method} ${req.url} - ${status} (${ms}ms)`, 'warning')
  }
}

export function withLogging(handler) {
  return async (req, res) => {
    const start = Date.now()
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      logRequest(req, res.statusCode, Date.now() - start)
      return originalJson(body)
    }
    try {
      return await handler(req, res)
    } catch (err) {
      initSentry()
      Sentry.captureException(err)
      throw err
    }
  }
}

export function handleError(res, err, context = 'API') {
  console.error(`${context} error:`, err)
  initSentry()
  Sentry.captureException(err, { extra: { context } })
  return res.status(500).json({ error: 'Something went wrong. Please try again.' })
}