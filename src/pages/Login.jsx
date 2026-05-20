import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useResponsive } from '../config/responsive'

export default function Login() {
  const { isMobile } = useResponsive()
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
    if (!error) navigate('/dashboard')
    else setError('Invalid email or password')
    setLoading(false)
  }

  return (
<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', padding: isMobile ? '16px' : '24px', fontFamily: 'DM Sans, sans-serif' }}>
        <div style={{ width: '100%', maxWidth: '400px', animation: 'fadeSlideIn 0.4s cubic-bezier(0.22,1,0.36,1)' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '24px' }}>
            <svg width="32" height="32" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
              <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
            </svg>
            <span style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>verto</span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.3px', fontFamily: "'Syne', sans-serif" }}>Welcome back</h2>
          <p style={{ fontSize: '14px', color: '#7d8590' }}>Sign in to see your matched opportunities</p>
        </div>

        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: isMobile ? '20px 16px' : '32px' }}>
          {error && (
            <div style={{ padding: '11px 14px', backgroundColor: 'rgba(248,81,73,0.1)', border: '1px solid rgba(248,81,73,0.2)', borderRadius: '8px', color: '#f85149', fontSize: '13px', marginBottom: '20px' }}>{error}</div>
          )}
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {[{ name: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com', value: email, onChange: e => setEmail(e.target.value) },
              { name: 'password', label: 'Password', type: 'password', placeholder: '••••••••', value: password, onChange: e => setPassword(e.target.value) }
            ].map(field => (
              <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '12px', fontWeight: '700', color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{field.label}</label>
                <input type={field.type} placeholder={field.placeholder} value={field.value} onChange={field.onChange} required
                  style={{ padding: '11px 14px', borderRadius: '8px', border: `1px solid ${focused === field.name ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`, backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit', outline: 'none', transition: 'border-color 0.2s ease', boxSizing: 'border-box', width: '100%' }}
                  onFocus={() => setFocused(field.name)} onBlur={() => setFocused(null)} />
              </div>
            ))}
            <button type="submit" disabled={loading} style={{ marginTop: '4px', padding: '13px 16px', minHeight: '44px', borderRadius: '10px', backgroundColor: loading ? '#1c2330' : '#f59e0b', color: loading ? '#484f58' : '#0d1117', fontSize: '14px', fontWeight: '700', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>
          <p style={{ fontSize: '13px', color: '#484f58', textAlign: 'center', marginTop: '20px' }}>
            Don't have an account?{' '}
            <Link to="/signup" style={{ color: '#f59e0b', textDecoration: 'none', fontWeight: '600' }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  )
}