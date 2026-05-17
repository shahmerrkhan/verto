export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('Notifications not supported')
    return false
  }

  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export function sendNotification(title, options = {}) {
  if (Notification.permission !== 'granted') return

  const notification = new Notification(title, {
    icon: '/verto-icon.png',
    badge: '/verto-badge.png',
    ...options,
  })

  setTimeout(() => notification.close(), 5000)
  return notification
}

export async function scheduleDeadlineNotification(opportunity, daysBeforeDeadline = 3) {
  if (!opportunity.deadline || !opportunity.id || !opportunity.title) return

  const deadlineDate = new Date(opportunity.deadline)
  const notificationDate = new Date(
    deadlineDate.getTime() - daysBeforeDeadline * 24 * 60 * 60 * 1000
  )
  const now = new Date()

  if (notificationDate <= now) return

  const existing = JSON.parse(localStorage.getItem('verto-scheduled-notifications') || '[]')
  const filtered = existing.filter(n => n.id !== `deadline-${opportunity.id}-${daysBeforeDeadline}`)

  filtered.push({
    id: `deadline-${opportunity.id}-${daysBeforeDeadline}`,
    title: `Deadline reminder: ${opportunity.title} closes in ${daysBeforeDeadline} days!`,
    body: `Deadline: ${deadlineDate.toLocaleDateString()}`,
    tag: `deadline-${opportunity.id}`,
    fireAt: notificationDate.toISOString(),
  })

  localStorage.setItem('verto-scheduled-notifications', JSON.stringify(filtered))
}

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return

  try {
    const reg = await navigator.serviceWorker.register('/sw.js')
    console.log('Service Worker registered')
    return reg
  } catch (err) {
    console.warn('Service Worker registration failed:', err)
  }
}