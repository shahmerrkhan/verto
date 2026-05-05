export function getAvatarColor(name) {
  if (!name) return { bg: '#f59e0b', text: '#0d1117' }

  const colors = [
    { bg: '#f59e0b', text: '#0d1117' }, // amber
    { bg: '#3fb950', text: '#0d1117' }, // green
    { bg: '#818cf8', text: '#fff' },    // indigo
    { bg: '#c084fc', text: '#fff' },    // purple
    { bg: '#38bdf8', text: '#0d1117' }, // sky
    { bg: '#f472b6', text: '#0d1117' }, // pink
    { bg: '#fb923c', text: '#0d1117' }, // orange
    { bg: '#34d399', text: '#0d1117' }, // emerald
  ]

  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

export function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}