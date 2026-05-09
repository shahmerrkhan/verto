const NOTIFICATION_PERMISSION_KEY = 'verto-notif-permission'

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
  
  // Auto-close after 5 seconds
  setTimeout(() => notification.close(), 5000)
  
  return notification
}

export async function scheduleDeadlineNotification(opportunity, daysBeforeDeadline = 3) {
  if (!opportunity.deadline) return
  
  const deadlineDate = new Date(opportunity.deadline)
  const notificationDate = new Date(deadlineDate.getTime() - daysBeforeDeadline * 24 * 60 * 60 * 1000)
  const now = new Date()
  
  if (notificationDate > now) {
    const delay = notificationDate.getTime() - now.getTime()
    
    setTimeout(() => {
      sendNotification(`⏰ ${opportunity.title} closes in ${daysBeforeDeadline} days!`, {
        body: `Deadline: ${deadlineDate.toLocaleDateString()}`,
        tag: `deadline-${opportunity.id}`,
        requireInteraction: false,
      })
    }, delay)
  }
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered')
    } catch (err) {
      console.warn('Service Worker registration failed:', err)
    }
  }
}