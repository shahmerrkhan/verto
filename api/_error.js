export function handleError(res, err, context = 'API') {
  console.error(`${context} error:`, err)
  return res.status(500).json({ error: 'Something went wrong. Please try again.' })
}