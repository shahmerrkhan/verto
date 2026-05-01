import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signUp(email, password)
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    navigate('/onboarding')
  }

  return (
    <div div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={styles.card}>

        <div style={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={styles.logoText}>verto</span>
        </div>

        <h2 style={styles.heading}>Create your account</h2>
        <p style={styles.subtext}>Find opportunities matched to you</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              style={{
                ...styles.input,
                borderColor: focused === 'email' ? '#064e3b' : '#e0e0e0',
                boxShadow: focused === 'email' ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
              }}
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={{
                ...styles.input,
                borderColor: focused === 'password' ? '#064e3b' : '#e0e0e0',
                boxShadow: focused === 'password' ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
              }}
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <button
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            type="submit"
            disabled={loading}
            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
          >
            {loading ? 'Creating account...' : 'Create account →'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
    padding: '24px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px 32px',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeSlideIn 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '28px',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  heading: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '6px',
    textAlign: 'center',
    letterSpacing: '-0.3px',
  },
  subtext: {
    fontSize: '14px',
    color: '#9ca3af',
    marginBottom: '28px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '18px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#374151',
  },
  input: {
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    width: '100%',
    outline: 'none',
    backgroundColor: '#fafafa',
  },
  button: {
    marginTop: '4px',
    padding: '13px 16px',
    borderRadius: '10px',
    border: 'none',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
  },
  errorBox: {
    padding: '11px 14px',
    backgroundColor: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '10px',
    color: '#dc2626',
    fontSize: '13px',
  },
  footer: {
    marginTop: '20px',
    textAlign: 'center',
    fontSize: '13px',
    color: '#9ca3af',
  },
  link: {
    color: '#064e3b',
    fontWeight: '600',
    textDecoration: 'none',
  },
}