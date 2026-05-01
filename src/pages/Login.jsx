import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState(null)
  const navigate = useNavigate()
  const { signIn } = useAuth()

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    if (!error) {
      navigate('/dashboard')
    } else {
      setError('Invalid email or password')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f9fafb', padding: '24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={styles.formWrapper}>

        <div style={styles.logoRow}>
          <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={styles.logoText}>verto</span>
        </div>

        <h2 style={styles.heading}>Welcome back</h2>
        <p style={styles.subtext}>Sign in to see your matched opportunities</p>

        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={{
                ...styles.input,
                borderColor: focused === 'email' ? '#064e3b' : '#e0e0e0',
                boxShadow: focused === 'email' ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
              }}
              onFocus={() => setFocused('email')}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                ...styles.input,
                borderColor: focused === 'password' ? '#064e3b' : '#e0e0e0',
                boxShadow: focused === 'password' ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
              }}
              onFocus={() => setFocused('password')}
              onBlur={() => setFocused(null)}
              required
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.submitBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
            onMouseEnter={e => { if (!loading) e.target.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.target.style.transform = 'translateY(0)' }}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Create one free</Link>
        </p>
      </div>
    </div>
  )
}

const styles = {
  formWrapper: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '40px 32px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
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
  submitBtn: {
    marginTop: '4px',
    padding: '13px 16px',
    borderRadius: '10px',
    backgroundColor: '#064e3b',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
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
    marginBottom: '20px',
  },
  footerText: {
    fontSize: '13px',
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: '20px',
  },
  link: {
    color: '#064e3b',
    textDecoration: 'none',
    fontWeight: '600',
  },
}