const DB_NAME = 'verto-db'
const STORE_NAMES = ['opportunities', 'saves', 'applications', 'metadata', 'profile', 'collections']

let db = null

export async function initOfflineDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      db = request.result
      resolve(db)
    }
    
    request.onupgradeneeded = (event) => {
      const idb = event.target.result
      STORE_NAMES.forEach(name => {
        if (!idb.objectStoreNames.contains(name)) {
          idb.createObjectStore(name, { keyPath: 'id' })
        }
      })
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
  return new Promise((resolve, reject) => {
    const tx = db.transaction([storeName], 'readwrite')
    const store = tx.objectStore(storeName)
    store.clear()
    dataArray.forEach(item => store.put(item))
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

export async function clearOfflineDB() {
  if (!db) await initOfflineDB()
  return new Promise((resolve) => {
    const tx = db.transaction(STORE_NAMES, 'readwrite')
    STORE_NAMES.forEach(name => tx.objectStore(name).clear())
    tx.oncomplete = () => resolve()
  })
}

export function isOnline() {
  return navigator.onLine
}