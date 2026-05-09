import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Analytics } from '@vercel/analytics/react'
import { AuthProvider } from './context/AuthContext'
import './index.css'
import App from './App'

// Import all initialization modules
import './lib/supabaseHealth'
import './lib/requestSigning'
import './lib/offlineSupport'
import { validateEnv } from './lib/envValidation'
import { initOfflineDB } from './lib/offlineSupport'
import { requestNotificationPermission, registerServiceWorker } from './lib/pushNotifications'
import { scheduleDataCleanup, scheduleAnalyticsUpdate } from './lib/backgroundJobs'
import { trackPageView } from './lib/analytics'

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