import * as Sentry from '@sentry/react'

export function logError(error, context) {
  console.error(`Error (${context}):`, error)
  Sentry.captureException(error, { extra: { context } })
}

export function sendAlert(error) {
  Sentry.captureMessage(error.message, 'fatal')
}