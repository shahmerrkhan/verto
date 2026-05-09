const events = []

export function trackEvent(eventName, eventData = {}) {
  const event = {
    name: eventName,
    data: eventData,
    timestamp: new Date().toISOString(),
    url: window.location.pathname,
  }
  
  events.push(event)
  
  // Send to backend every 30 events or every 30 seconds
  if (events.length >= 30) {
    flushAnalytics()
  }
}

export async function flushAnalytics() {
  if (events.length === 0) return
  
  const batch = [...events]
  events.length = 0
  
  try {
    // Send to your backend
    // await fetch('/api/analytics', { method: 'POST', body: JSON.stringify(batch) })
    console.log('Analytics batch sent:', batch)
  } catch (err) {
    console.error('Analytics flush failed:', err)
  }
}

// Auto-flush every 30 seconds
setInterval(flushAnalytics, 30000)

// Flush on page unload
window.addEventListener('beforeunload', flushAnalytics)

// Track common events
export function trackSave(opportunityId) {
  trackEvent('opportunity_saved', { opportunityId })
}

export function trackApplication(opportunityId) {
  trackEvent('application_tracked', { opportunityId })
}

export function trackSearch(query) {
  trackEvent('search_performed', { query })
}

export function trackPageView(page) {
  trackEvent('page_viewed', { page })
}