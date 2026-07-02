import { useState, useEffect } from 'react'

export default function AdminArticles() {
  const [pending, setPending] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  async function fetchPending() {
    setLoading(true)
    const res = await fetch('/api/articles?action=pending')
    const json = await res.json()
    setPending(Array.isArray(json.data) ? json.data : [])
    setLoading(false)
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPending()
  }, [])

  async function moderate(id, approve) {
    setBusyId(id)
    await fetch('/api/articles?action=moderate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approve }),
    })
    setPending(prev => prev.filter(a => a.id !== id))
    setBusyId(null)
  }

  return (
    <div style={{ maxWidth: '860px', margin: '0 auto', padding: '80px 24px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '20px' }}>Pending articles</h1>
      {loading ? (
        <p>Loading...</p>
      ) : pending.length === 0 ? (
        <p style={{ color: '#6b7280' }}>No pending articles.</p>
      ) : (
        pending.map(a => (
          <div key={a.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
            <h3 style={{ margin: '0 0 6px' }}>{a.title}</h3>
            <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 10px' }}>by {a.author_name}</p>
            <p style={{ fontSize: '14px', color: '#374151', marginBottom: '14px' }}>{a.excerpt || a.content.slice(0, 200)}</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button disabled={busyId === a.id} onClick={() => moderate(a.id, true)} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', backgroundColor: '#064e3b', color: '#fff', fontWeight: 600, cursor: 'pointer' }}>Approve</button>
              <button disabled={busyId === a.id} onClick={() => moderate(a.id, false)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #e5e7eb', backgroundColor: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer' }}>Reject</button>
            </div>
          </div>
        ))
      )}
    </div>
  )
}