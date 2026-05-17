import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.2,
})

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App'

// Import all initialization modules
import './lib/supabaseHealth'
import './lib/offlineSupport'
import { validateEnv } from './lib/envValidation'
import { initOfflineDB } from './lib/offlineSupport'
import { requestNotificationPermission, registerServiceWorker } from './lib/pushNotifications'
import { scheduleDataCleanup, scheduleAnalyticsUpdate } from './lib/backgroundJobs'
import { trackPageView } from './lib/analytics'
import { getOfflineQueue, deleteFromOffline, isOnline } from './lib/offlineSupport'
import { saveOpportunity, trackApplication } from './lib/dbHelpers'

async function replayOfflineQueue() {
  if (!isOnline()) return
  try {
    const queue = await getOfflineQueue()
    for (const op of queue) {
      try {
        if (op.type === 'save') await saveOpportunity(op.userId, op.opportunityId)
        if (op.type === 'application') await trackApplication(op.userId, op.opportunityId)
        await deleteFromOffline('sync_queue', op.id)
      } catch (err) {
        console.warn('Failed to replay offline op:', op, err)
      }
    }
  } catch (err) {
    console.warn('Offline queue replay failed:', err)
  }
}

window.addEventListener('online', replayOfflineQueue)

// Wire up service worker message bridge for scheduled notifications
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.addEventListener('message', event => {
    if (event.data?.type === 'GET_SCHEDULED_NOTIFICATIONS') {
      const notifications = JSON.parse(
        localStorage.getItem('verto-scheduled-notifications') || '[]'
      )
      event.source.postMessage({
        type: 'SCHEDULED_NOTIFICATIONS',
        payload: notifications,
      })
    }

    if (event.data?.type === 'CLEAR_FIRED_NOTIFICATIONS') {
      const fired = event.data.payload || []
      const existing = JSON.parse(
        localStorage.getItem('verto-scheduled-notifications') || '[]'
      )
      const remaining = existing.filter(n => !fired.includes(n.id))
      localStorage.setItem('verto-scheduled-notifications', JSON.stringify(remaining))
    }
  })
}

// Validate environment variables on app load
try {
  validateEnv()
} catch (err) {
  console.error('Environment validation failed:', err.message)
  document.body.innerHTML = '<h1>Configuration error. Check console.</h1>'
  throw err
}

// Initialize offline DB
initOfflineDB().catch(err => console.warn('IndexedDB not available:', err))

// Register service worker for push notifications
registerServiceWorker()

// Request notification permission
requestNotificationPermission()

// Schedule background jobs
scheduleDataCleanup()
scheduleAnalyticsUpdate()

// Track page view
trackPageView('/')

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <Analytics />
    </AuthProvider>
  </StrictMode>
)