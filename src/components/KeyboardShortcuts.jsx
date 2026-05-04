import { useEffect } from 'react'

export default function KeyboardShortcuts({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const shortcuts = [
    { keys: ['⌘', 'K'], label: 'Open global search' },
    { keys: ['?'], label: 'Show keyboard shortcuts' },
    { keys: ['Esc'], label: 'Close any modal or palette' },
    { keys: ['↑', '↓'], label: 'Navigate search results' },
    { keys: ['↵'], label: 'Open selected result' },
  ]

  const pages = [
    { keys: ['G', 'H'], label: 'Go to Dashboard' },
    { keys: ['G', 'S'], label: 'Go to Saved' },
    { keys: ['G', 'C'], label: 'Go to Courses' },
    { keys: ['G', 'A'], label: 'Go to Analytics' },
    { keys: ['G', 'P'], label: 'Go to Profile' },
  ]

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', zIndex: 9500, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', animation: 'fadeIn 0.15s ease' }}>
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '480px', backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 24px 64px rgba(0,0,0,0.8)', animation: 'slideDown 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>

        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '13px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Keyboard shortcuts</p>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#7d8590', fontSize: '12px' }}>✕</button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>General</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {shortcuts.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#7d8590' }}>{s.label}</span>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {s.keys.map((k, j) => (
                      <kbd key={j} style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#e6edf3', fontSize: '11px', fontFamily: 'inherit', fontWeight: '600' }}>{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 12px' }}>Navigation</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {pages.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#7d8590' }}>{s.label}</span>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {s.keys.map((k, j) => (
                      <span key={j} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <kbd style={{ padding: '3px 8px', borderRadius: '5px', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: 'rgba(255,255,255,0.06)', color: '#e6edf3', fontSize: '11px', fontFamily: 'inherit', fontWeight: '600' }}>{k}</kbd>
                        {j < s.keys.length - 1 && <span style={{ fontSize: '10px', color: '#484f58' }}>then</span>}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', backgroundColor: 'rgba(255,255,255,0.02)' }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#484f58', textAlign: 'center' }}>Press <kbd style={{ padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'rgba(255,255,255,0.04)', fontSize: '10px', color: '#7d8590', fontFamily: 'inherit' }}>Esc</kbd> to close</p>
        </div>
      </div>
    </div>
  )
}