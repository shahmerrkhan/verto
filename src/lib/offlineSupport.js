const DB_NAME = 'verto-db'
const DB_VERSION = 2

const STORES = {
  opportunities: { keyPath: 'id' },
  profile:       { keyPath: 'id' },
  collections:   { keyPath: 'id' },
  saves:         { keyPath: ['user_id', 'opportunity_id'] },
  applications:  { keyPath: ['user_id', 'opportunity_id'] },
  metadata:      { keyPath: ['user_id', 'opportunity_id'] },
  sync_queue:    { keyPath: 'id' },
}

let db = null

export async function initOfflineDB() {
  if (db) return db
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }

    request.onupgradeneeded = (event) => {
      const idb = event.target.result
      // Drop old stores that had wrong keyPath
      const toDelete = ['saves', 'applications', 'metadata', 'sync_queue']
      toDelete.forEach(name => {
        if (idb.objectStoreNames.contains(name)) idb.deleteObjectStore(name)
      })
      // Create all stores fresh
      for (const [name, config] of Object.entries(STORES)) {
        if (!idb.objectStoreNames.contains(name)) {
          idb.createObjectStore(name, { keyPath: config.keyPath })
        }
      }
    }
  })
}

export async function saveToOffline(storeName, data) {
  if (!db) await initOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.put(data)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveArrayToOffline(storeName, dataArray) {
  if (!db) await initOfflineDB()
  if (!Array.isArray(dataArray) || dataArray.length === 0) return
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite')
    const store = tx.objectStore(storeName)
    store.clear()
    for (const item of dataArray) {
      if (item) store.put(item)
    }
    tx.onerror = () => reject(tx.error)
    tx.oncomplete = () => resolve()
  })
}

export async function getFromOffline(storeName, key) {
  if (!db) await initOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.get(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function getAllFromOffline(storeName) {
  if (!db) await initOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readonly')
    const store = tx.objectStore(storeName)
    const request = store.getAll()
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function deleteFromOffline(storeName, key) {
  if (!db) await initOfflineDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite')
    const store = tx.objectStore(storeName)
    const request = store.delete(key)
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}

export async function clearOfflineDB() {
  if (!db) await initOfflineDB()
  return new Promise((resolve) => {
    const tx = db.transaction(Object.keys(STORES), 'readwrite')
    Object.keys(STORES).forEach(name => tx.objectStore(name).clear())
    tx.oncomplete = () => resolve()
  })
}

export async function queueOfflineMutation(operation) {
  await saveToOffline('sync_queue', {
    ...operation,
    id: crypto.randomUUID(),
    queuedAt: new Date().toISOString(),
  })
}

export async function getOfflineQueue() {
  return getAllFromOffline('sync_queue')
}

export function isOnline() {
  return navigator.onLine
}