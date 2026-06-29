import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

export default function SubmitArticle() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required')
      setLoading(false)
      return
    }

    const res = await fetch('/api/articles/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        authorId: user.id,
        authorName: profile?.full_name || 'Anonymous',
        title: formData.title,
        excerpt: formData.excerpt || formData.content.substring(0, 150),
        content: formData.content,
      }),
    })

    if (!res.ok) {
      setError('Failed to submit article')
      setLoading(false)
      return
    }

    setSuccess(true)
    setFormData({ title: '', excerpt: '', content: '' })
    setTimeout(() => navigate('/articles'), 2000)
  }

  return (
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>
          <div style={styles.pageTitle}>
        <h1 style={styles.title}>Share your knowledge</h1>
        <p style={styles.subtitle}>Write an article for the community. We'll review and publish it.</p>
      </div>

      {success && (
        <div style={styles.successBanner}>
          <span style={styles.successIcon}>✓</span>
          <div>
            <p style={styles.successTitle}>Article submitted!</p>
            <p style={styles.successSubtext}>Thanks for sharing. We'll review it and publish soon.</p>
          </div>
        </div>
      )}

      {error && (
        <div style={styles.errorBanner}>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Article title *</label>
          <input
            type="text"
            placeholder="e.g., How to ace your coding interview"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Brief excerpt</label>
          <input
            type="text"
            placeholder="One sentence summary (optional)"
            value={formData.excerpt}
            onChange={e => setFormData({ ...formData, excerpt: e.target.value })}
            style={styles.input}
          />
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>Content *</label>
          <textarea
            placeholder="Write your article here... (Markdown supported)"
            value={formData.content}
            onChange={e => setFormData({ ...formData, content: e.target.value })}
            style={styles.textarea}
            rows="14"
          />
          <p style={styles.charCount}>{formData.content.length} characters</p>
        </div>

        <div style={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            style={{...styles.submitBtn, opacity: loading ? 0.6 : 1}}
            onMouseEnter={e => !loading && (e.target.style.backgroundColor = '#0d5a47')}
            onMouseLeave={e => !loading && (e.target.style.backgroundColor = '#064e3b')}
          >
            {loading ? 'Submitting...' : 'Submit article'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/articles')}
            style={styles.cancelBtn}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

const styles = {
  pageTitle: { marginBottom: '32px', marginTop: '32px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', marginBottom: '6px', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  successBanner: { display: 'flex', gap: '12px', backgroundColor: '#f0fdf4', border: '1.5px solid #86efac', borderRadius: '12px', padding: '16px', marginBottom: '24px', alignItems: 'flex-start' },
  successIcon: { fontSize: '20px', color: '#10b981', fontWeight: '700', flexShrink: 0 },
  successTitle: { fontSize: '14px', fontWeight: '700', color: '#166534', margin: '0 0 4px 0' },
  successSubtext: { fontSize: '13px', color: '#166534', margin: 0 },
  errorBanner: { backgroundColor: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: '12px', padding: '12px 16px', marginBottom: '24px' },
  errorText: { fontSize: '13px', color: '#991b1b', margin: 0 },
  form: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '28px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' },
  input: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 14px', borderRadius: '8px', border: '1.5px solid #e0e0e0', fontSize: '14px', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' },
  charCount: { fontSize: '12px', color: '#9ca3af', margin: '6px 0 0 0' },
  buttonGroup: { display: 'flex', gap: '12px', marginTop: '24px' },
  submitBtn: { padding: '12px 24px', borderRadius: '10px', backgroundColor: '#064e3b', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  cancelBtn: { padding: '12px 24px', borderRadius: '10px', border: '1.5px solid #e0e0e0', backgroundColor: 'transparent', color: '#666', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit' },
}