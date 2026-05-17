// Handle push events from server
self.addEventListener('push', event => {
  const data = event.data.json()
  const options = {
    body: data.body,
    icon: '/verto-icon.png',
    badge: '/verto-badge.png',
    tag: data.tag,
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// Handle notification click
self.addEventListener('notificationclick', event => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      if (clientList.length > 0) {
        clientList[0].focus()
      } else {
        clients.openWindow('/')
      }
    })
  )
})

// Check localStorage for scheduled notifications every hour
self.addEventListener('periodicsync', event => {
  if (event.tag === 'check-deadlines') {
    event.waitUntil(checkScheduledNotifications())
  }
})

// Also check when service worker starts up
self.addEventListener('activate', event => {
  event.waitUntil(checkScheduledNotifications())
})

async function checkScheduledNotifications() {
  const allClients = await clients.matchAll()

  // Ask the open tab for the scheduled notifications from localStorage
  // since service workers can't access localStorage directly
  if (allClients.length === 0) return

  allClients[0].postMessage({ type: 'GET_SCHEDULED_NOTIFICATIONS' })
}

// Receive scheduled notifications from the tab
self.addEventListener('message', event => {
  if (event.data?.type === 'SCHEDULED_NOTIFICATIONS') {
    const notifications = event.data.payload || []
    const now = new Date()

    notifications.forEach(notification => {
      const fireAt = new Date(notification.fireAt)
      if (fireAt <= now) {
        self.registration.showNotification(notification.title, {
          body: notification.body,
          tag: notification.tag,
          icon: '/verto-icon.png',
          badge: '/verto-badge.png',
        })
      }
    })

    // Tell the tab which ones fired so it can remove them
    event.source.postMessage({
      type: 'CLEAR_FIRED_NOTIFICATIONS',
      payload: notifications
        .filter(n => new Date(n.fireAt) <= now)
        .map(n => n.id)
    })
  }
})