import { useState } from 'react'

export default function ShareButton({ opportunity }) {
  const [copied, setCopied] = useState(false)

  function handleShare() {
    const text = `Check out "${opportunity.title}" from ${opportunity.org_name} on Verto — ${window.location.origin}`
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button style={{
      ...styles.btn,
      backgroundColor: copied ? '#f0fdf4' : '#fff',
      borderColor: copied ? '#6ee7b7' : '#ddd',
      color: copied ? '#064e3b' : '#666',
    }} onClick={handleShare}>
      {copied ? '✓ Copied' : 'Share 🔗'}
    </button>
  )
}

const styles = {
  btn: {
    flex: 1,
    minWidth: '100px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    backgroundColor: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
}