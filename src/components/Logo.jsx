import { useNavigate } from 'react-router-dom'

export default function Logo() {
  const navigate = useNavigate()

  return (
    <div
      style={styles.logoContainer}
      onClick={() => navigate('/dashboard')}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <svg width="30" height="30" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
        <rect width="80" height="80" rx="16" fill="#064e3b"/>
        <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
        <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
      </svg>
      <h1 style={styles.logo}>verto</h1>
    </div>
  )
}

const styles = {
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    userSelect: 'none',
    width: 'fit-content',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#064e3b',
    margin: 0,
    letterSpacing: '-0.5px',
  },
}