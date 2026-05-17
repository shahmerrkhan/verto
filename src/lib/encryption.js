const getKey = async () => {
  const raw = import.meta.env.VITE_ENCRYPTION_KEY
  if (!raw) throw new Error('VITE_ENCRYPTION_KEY is not set')
  const encoded = new TextEncoder().encode(raw.padEnd(32, '0').slice(0, 32))
  return crypto.subtle.importKey('raw', encoded, 'AES-GCM', false, ['encrypt', 'decrypt'])
}

export async function encryptNotes(notes) {
  if (!notes) return notes
  try {
    const key = await getKey()
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const encoded = new TextEncoder().encode(notes)
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded)
    const combined = new Uint8Array(iv.byteLength + encrypted.byteLength)
    combined.set(iv, 0)
    combined.set(new Uint8Array(encrypted), iv.byteLength)
    return btoa(String.fromCharCode(...combined))
  } catch (err) {
    console.error('Encryption failed:', err)
    return notes
  }
}

export async function decryptNotes(encrypted) {
  if (!encrypted) return encrypted
  try {
    const key = await getKey()
    const combined = Uint8Array.from(atob(encrypted), c => c.charCodeAt(0))
    const iv = combined.slice(0, 12)
    const data = combined.slice(12)
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data)
    return new TextDecoder().decode(decrypted)
  } catch (err) {
    console.error('Decryption failed:', err)
    return encrypted
  }
}