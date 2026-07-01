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

    const res = await fetch('/api/articles?action=submit', {
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '96px 24px 80px', backgroundColor: 'var(--bg-base)', minHeight: '100vh' }}>
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
  title: { fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: 'var(--font-display)' },
  subtitle: { fontSize: '15px', color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font-sans)' },
  successBanner: { display: 'flex', gap: '12px', backgroundColor: 'var(--success-muted)', border: '1px solid var(--success)', borderRadius: 'var(--radius-md)', padding: '16px', marginBottom: '24px', alignItems: 'flex-start' },
  successIcon: { fontSize: '16px', color: 'var(--success)', fontWeight: '700', flexShrink: 0 },
  successTitle: { fontSize: '14px', fontWeight: '700', color: 'var(--success)', margin: '0 0 4px 0', fontFamily: 'var(--font-sans)' },
  successSubtext: { fontSize: '13px', color: 'var(--success)', margin: 0, fontFamily: 'var(--font-sans)' },
  errorBanner: { backgroundColor: 'var(--danger-muted)', border: '1px solid var(--danger)', borderRadius: 'var(--radius-md)', padding: '12px 16px', marginBottom: '24px' },
  errorText: { fontSize: '13px', color: 'var(--danger)', margin: 0, fontFamily: 'var(--font-sans)' },
  form: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-lg)', padding: '28px' },
  formGroup: { marginBottom: '20px' },
  label: { display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px', fontFamily: 'var(--font-sans)' },
  input: { width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-sans)', boxSizing: 'border-box' },
  textarea: { width: '100%', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: '14px', fontFamily: 'var(--font-sans)', boxSizing: 'border-box', resize: 'vertical' },
  charCount: { fontSize: '12px', color: 'var(--text-muted)', margin: '6px 0 0 0', fontFamily: 'var(--font-sans)' },
  buttonGroup: { display: 'flex', gap: '12px', marginTop: '24px' },
  submitBtn: { padding: '12px 24px', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--accent-violet)', color: '#fff', border: 'none', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all var(--transition)', fontFamily: 'var(--font-sans)' },
  cancelBtn: { padding: '12px 24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', backgroundColor: 'transparent', color: 'var(--text-muted)', fontSize: '14px', fontWeight: '500', cursor: 'pointer', transition: 'all var(--transition)', fontFamily: 'var(--font-sans)' },
}