import { Link } from 'react-router-dom'

export default function VerifyEmail() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0d1117', padding: '24px', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
        <div style={{ fontSize: '48px', marginBottom: '24px' }}>📬</div>
        <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#e6edf3', marginBottom: '12px', fontFamily: "'Syne', sans-serif" }}>Check your email</h2>
        <p style={{ fontSize: '14px', color: '#7d8590', marginBottom: '24px' }}>We sent a confirmation link to your email. Click it to activate your account.</p>
        <Link to="/login" style={{ color: '#f59e0b', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>Back to login</Link>
      </div>
    </div>
  )
}