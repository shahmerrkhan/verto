export function logRequest(req, status, ms) {
  console.log(JSON.stringify({
    method: req.method, url: req.url, status, ms, timestamp: new Date().toISOString(),
  }))
}

export function withLogging(handler) {
  return async (req, res) => {
    const start = Date.now()
    const originalJson = res.json.bind(res)
    res.json = (body) => {
      logRequest(req, res.statusCode, Date.now() - start)
      return originalJson(body)
    }
    return handler(req, res)
  }
}

export function handleError(res, err, context = 'API') {
  console.error(`${context} error:`, err)
  return res.status(500).json({ error: 'Something went wrong. Please try again.' })
}