import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import KeyboardShortcuts from './KeyboardShortcuts'

export default function ShortcutManager() {
  const [shortcutsOpen, setShortcutsOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let sequence = []
    const shortcuts = {
      'gh': '/dashboard',
      'gs': '/saves',
      'gc': '/courses',
      'ga': '/analytics',
      'gp': '/profile',
    }

    function handleKey(e) {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.key === '?') { setShortcutsOpen(true); return }

      sequence.push(e.key.toLowerCase())
      if (sequence.length > 2) sequence.shift()

      const combo = sequence.join('')
      if (shortcuts[combo]) {
        navigate(shortcuts[combo])
        sequence = []
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [navigate])

  return shortcutsOpen ? <KeyboardShortcuts onClose={() => setShortcutsOpen(false)} /> : null
}