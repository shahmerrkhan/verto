import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useResponsive } from '../config/responsive'

const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research',
  'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics',
  'Medicine & Health', 'Environment & Sustainability', 'Education',
  'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]

const PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
]

const GPA_RANGES = ['4.0', '3.5-3.9', '3.0-3.4', '2.5-2.9', 'Below 2.5', 'N/A']

export default function Profile() {
  const { isMobile } = useResponsive()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    grade: profile?.grade || '',
    province: profile?.province || '',
    interests: profile?.interests || [],
    gpa_range: profile?.gpa_range || '',
    financial_need: profile?.financial_need || false,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [focused, setFocused] = useState(null)

  function toggleInterest(interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  async function handleSave() {
    setLoading(true)
    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        grade: parseInt(form.grade),
        province: form.province,
        interests: form.interests,
        gpa_range: form.gpa_range,
        financial_need: form.financial_need,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputStyle = (name) => ({
    ...styles.input,
    borderColor: focused === name ? '#064e3b' : '#e0e0e0',
    boxShadow: focused === name ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
  })

  return (
<div style={{ ...styles.container, padding: isMobile ? '24px 16px' : '40px 24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
<div style={{ ...styles.header, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'flex-start' : 'center', gap: isMobile ? '12px' : '0' }} className="header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <svg width="30" height="30" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
            <rect width="80" height="80" rx="16" fill="#064e3b"/>
            <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            <polygon points="40,12 64,68 58,68 40,26 22,68 16,68" fill="#6ee7b7" opacity="0.4"/>
          </svg>
          <span style={styles.logoText}>verto</span>
        </div>
<div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
            <button
            style={{ ...styles.backBtn, flex: isMobile ? 1 : 'none', minHeight: '44px' }}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
          >
            ← Dashboard
          </button>
          <button
            style={{ ...styles.signOutBtn, flex: isMobile ? 1 : 'none', minHeight: '44px' }}
            onClick={signOut}
            onMouseEnter={e => { e.target.style.backgroundColor = '#f3f4f6' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent' }}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={styles.pageTitle}>
        <h1 style={styles.title}>Your profile</h1>
        <p style={styles.subtitle}>Update your info to get better matched opportunities</p>
      </div>

<div style={{ ...styles.grid, gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: isMobile ? '12px' : '24px' }}>
          <div style={{ ...styles.section, padding: isMobile ? '16px' : '28px' }}>
          <h3 style={styles.sectionTitle}>Basic info</h3>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full name</label>
            <input
              style={inputStyle('name')}
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
            />
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Grade</label>
            <select
              style={inputStyle('grade')}
              value={form.grade}
              onChange={e => setForm({ ...form, grade: e.target.value })}
              onFocus={() => setFocused('grade')}
              onBlur={() => setFocused(null)}
            >
              {[9, 10, 11, 12].map(g => (
                <option key={g} value={g}>Grade {g}</option>
              ))}
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Province</label>
            <select
              style={inputStyle('province')}
              value={form.province}
              onChange={e => setForm({ ...form, province: e.target.value })}
              onFocus={() => setFocused('province')}
              onBlur={() => setFocused(null)}
            >
              {PROVINCES.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>GPA range</label>
            <div style={styles.tagGrid}>
              {GPA_RANGES.map(g => (
                <button
                  key={g}
                  style={{
                    ...styles.tag,
                    ...(form.gpa_range === g ? styles.tagActive : {}),
                  }}
                  onClick={() => setForm({ ...form, gpa_range: g })}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div style={styles.checkRow}>
            <div
              style={{
                ...styles.checkbox,
                backgroundColor: form.financial_need ? '#064e3b' : '#fff',
                borderColor: form.financial_need ? '#064e3b' : '#d1d5db',
              }}
              onClick={() => setForm({ ...form, financial_need: !form.financial_need })}
            >
              {form.financial_need && <span style={styles.checkmark}>✓</span>}
            </div>
            <label
              style={styles.checkLabel}
              onClick={() => setForm({ ...form, financial_need: !form.financial_need })}
            >
              I have financial need
            </label>
          </div>
        </div>

        <div style={{ ...styles.section, padding: isMobile ? '16px' : '28px' }}>
          <h3 style={styles.sectionTitle}>Interests</h3>
          <p style={styles.sectionSub}>These drive your AI matches</p>
          <div style={styles.tagGrid}>
            {INTERESTS.map(interest => (
              <button
                key={interest}
                style={{
                  ...styles.tag,
                  ...(form.interests.includes(interest) ? styles.tagActive : {}),
                }}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ ...styles.saveRow, justifyContent: isMobile ? 'stretch' : 'flex-end' }}>
        <button
          style={{
            ...styles.saveBtn,
            width: isMobile ? '100%' : 'auto',
            minHeight: '44px',
            backgroundColor: saved ? '#f0fdf4' : '#064e3b',
            color: saved ? '#064e3b' : '#fff',
            border: saved ? '1.5px solid #6ee7b7' : 'none',
          }}
          onClick={handleSave}
          disabled={loading}
          onMouseEnter={e => { if (!saved) e.currentTarget.style.transform = 'translateY(-1px)' }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
        >
          {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '40px',
  },
  logoText: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#064e3b',
    letterSpacing: '-0.5px',
  },
  backBtn: {
    padding: '9px 16px',
    borderRadius: '10px',
    border: '1.5px solid #064e3b',
    backgroundColor: 'transparent',
    color: '#064e3b',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  signOutBtn: {
    padding: '9px 16px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    backgroundColor: 'transparent',
    color: '#666',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  pageTitle: {
    marginBottom: '32px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '6px',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))',
    gap: '24px',
    marginBottom: '32px',
  },
  section: {
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    padding: '28px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#111',
    marginBottom: '4px',
    letterSpacing: '-0.2px',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '16px',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginBottom: '16px',
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
    outline: 'none',
    backgroundColor: '#fafafa',
    boxSizing: 'border-box',
    width: '100%',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginTop: '4px',
  },
  tag: {
    padding: '7px 13px',
    borderRadius: '20px',
    border: '1.5px solid #e5e7eb',
    backgroundColor: '#fff',
    fontSize: '13px',
    cursor: 'pointer',
    color: '#374151',
    fontWeight: '500',
    transition: 'all 0.15s ease',
  },
  tagActive: {
    backgroundColor: '#064e3b',
    borderColor: '#064e3b',
    color: '#fff',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
    border: '1.5px solid #d1d5db',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    flexShrink: 0,
    cursor: 'pointer',
  },
  checkmark: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '500',
    cursor: 'pointer',
  },
  saveRow: {
    display: 'flex',
    justifyContent: 'flex-end',
  },
  saveBtn: {
    padding: '12px 28px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
  },
}