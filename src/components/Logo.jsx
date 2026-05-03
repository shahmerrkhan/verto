export default function Logo({ theme, currentTheme }) {
  const isDark = currentTheme && currentTheme !== 'cream'
  const textColor = theme ? theme.text : '#064e3b'
  const bgColor = isDark ? (theme ? theme.accent : '#34d399') : '#064e3b'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
      <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="16" fill={bgColor}/>
        <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill={isDark ? '#fff' : '#34d399'}/>
        <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill={isDark ? '#fff' : '#6ee7b7'} opacity="0.4"/>
      </svg>
      <span style={{
        fontSize: '16px',
        fontWeight: '700',
        color: textColor,
        letterSpacing: '-0.5px',
        fontFamily: 'inherit',
      }}>
        verto
      </span>
    </div>
  )
}