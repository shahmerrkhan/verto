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