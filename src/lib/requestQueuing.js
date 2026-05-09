const queue = []
let isProcessing = false
const BATCH_SIZE = 10
const BATCH_DELAY = 500 // ms

export function queueRequest(fn, priority = 'normal') {
  return new Promise((resolve, reject) => {
    queue.push({
      fn,
      resolve,
      reject,
      priority,
      timestamp: Date.now(),
    })
    
    if (priority === 'high') {
      queue.sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (a.priority !== 'high' && b.priority === 'high') return 1
        return a.timestamp - b.timestamp
      })
    }
    
    processQueue()
  })
}

async function processQueue() {
  if (isProcessing || queue.length === 0) return
  
  isProcessing = true
  
  while (queue.length > 0) {
    const batch = queue.splice(0, BATCH_SIZE)
    
    try {
      const results = await Promise.allSettled(batch.map(item => item.fn()))
      
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          batch[idx].resolve(result.value)
        } else {
          batch[idx].reject(result.reason)
        }
      })
    } catch (err) {
      batch.forEach(item => item.reject(err))
    }
    
    if (queue.length > 0) {
      await new Promise(resolve => setTimeout(resolve, BATCH_DELAY))
    }
  }
  
  isProcessing = false
}

export function getQueueSize() {
  return queue.length
}