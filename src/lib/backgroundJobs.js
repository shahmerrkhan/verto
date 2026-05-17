// Background jobs safe to run client-side
// Data cleanup runs via Supabase — nothing heavy here

export function scheduleJob(fn, intervalMs, immediate = false) {
  if (immediate) fn()
  return setInterval(fn, intervalMs)
}

export function scheduleAnalyticsUpdate() {
  return scheduleJob(() => {
    // flushAnalytics is already on a 30s interval in analytics.js
  }, 60 * 60 * 1000)
}

export function scheduleDataCleanup() {
  // Intentionally empty — runs server-side
}