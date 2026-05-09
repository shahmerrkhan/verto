// Simple encryption using base64 + XOR (not production-grade, but better than nothing)
// For real encryption, use TweetNaCl.js or libsodium.js

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'default-dev-key'

function xorEncrypt(text, key) {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return btoa(result) // Base64 encode
}

function xorDecrypt(encrypted, key) {
  const text = atob(encrypted) // Base64 decode
  let result = ''
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length))
  }
  return result
}

export function encryptNotes(notes) {
  if (!notes) return notes
  try {
    return xorEncrypt(notes, SECRET_KEY)
  } catch (err) {
    console.error('Encryption failed:', err)
    return notes
  }
}

export function decryptNotes(encrypted) {
  if (!encrypted) return encrypted
  try {
    return xorDecrypt(encrypted, SECRET_KEY)
  } catch (err) {
    console.error('Decryption failed:', err)
    return encrypted
  }
}