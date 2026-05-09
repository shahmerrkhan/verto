export function scheduleJob(fn, intervalMs, immediate = false) {
  if (immediate) fn()
  return setInterval(fn, intervalMs)
}

export function scheduleEmailReminder(userId, opportunityId, supabase) {
  // This would call your backend API
  // For now, just schedule a notification
  return scheduleJob(async () => {
    const { data } = await supabase
      .from('opportunities')
      .select('deadline, title')
      .eq('id', opportunityId)
      .single()
    
    if (data) {
      const daysLeft = Math.ceil((new Date(data.deadline) - new Date()) / (1000 * 60 * 60 * 24))
      if (daysLeft === 3 || daysLeft === 1 || daysLeft === 0) {
        // Send notification or log for backend processing
        console.log(`Reminder: ${data.title} closes in ${daysLeft} days`)
      }
    }
  }, 24 * 60 * 60 * 1000) // Check once per day
}

export function scheduleDataCleanup(supabase) {
  return scheduleJob(async () => {
    // Delete views older than 90 days
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    await supabase
      .from('opportunity_views')
      .delete()
      .lt('created_at', ninetyDaysAgo.toISOString())
  }, 7 * 24 * 60 * 60 * 1000) // Run weekly
}

export function scheduleAnalyticsUpdate(supabase) {
  return scheduleJob(async () => {
    // Update user activity summaries or aggregate stats
    console.log('Analytics update job running')
  }, 60 * 60 * 1000) // Run hourly
}