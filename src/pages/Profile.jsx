import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import Logo from '../components/Logo'


const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research',
  'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics',
  'Medicine & Health', 'Environment & Sustainability', 'Education',
  'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]

const PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
]

const PROVINCE_NAMES = {
  AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick',
  NL: 'Newfoundland', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut',
  ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon'
}

const GPA_RANGES = ['4.0', '3.5-3.9', '3.0-3.4', '2.5-2.9', 'Below 2.5', 'N/A']
const GRADES = [9, 10, 11, 12]

function CustomSelect({ label, value, options, onChange, renderLabel }) {
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState(null)

  return (
    <div style={styles.fieldGroup}>
      <label style={styles.label}>{label}</label>
      <div style={{ position: 'relative' }}>
        <button
          style={styles.selectTrigger}
          onClick={() => setOpen(!open)}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#064e3b'}
          onMouseLeave={e => { if (!open) e.currentTarget.style.borderColor = '#e0e0e0' }}
        >
          <span>{value ? (renderLabel ? renderLabel(value) : value) : `Select ${label.toLowerCase()}`}</span>
          <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▾</span>
        </button>
        {open && (
          <>
            <div style={styles.backdrop} onClick={() => setOpen(false)} />
            <div style={styles.dropdown}>
              {options.map(opt => {
                const val = typeof opt === 'object' ? opt.value : opt
                const lbl = typeof opt === 'object' ? opt.label : (renderLabel ? renderLabel(opt) : opt)
                return (
                  <button
                    key={val}
                    style={{
                      ...styles.dropdownOption,
                      backgroundColor: value === val ? '#f0fdf4' : hovered === val ? '#f9fafb' : '#fff',
                      color: value === val ? '#064e3b' : '#333',
                      fontWeight: value === val ? '600' : '400',
                    }}
                    onMouseEnter={() => setHovered(val)}
                    onMouseLeave={() => setHovered(null)}
                    onClick={() => { onChange(val); setOpen(false) }}
                  >
                    {lbl}
                    {value === val && <span style={{ color: '#064e3b', fontSize: '12px' }}>✓</span>}
                  </button>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default function Profile() {
  const { user, profile, signOut, refreshProfile } = useAuth()
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
    await refreshProfile()
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '40px 24px', animation: 'fadeSlideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1)' }}>
      <div style={styles.header} className="header">
        <Logo />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            style={styles.backBtn}
            onClick={() => navigate('/dashboard')}
            onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
          >
            ← Dashboard
          </button>
          <button
            style={styles.signOutBtn}
            onClick={signOut}
            onMouseEnter={e => e.target.style.backgroundColor = '#f3f4f6'}
            onMouseLeave={e => e.target.style.backgroundColor = 'transparent'}
          >
            Sign out
          </button>
        </div>
      </div>

      <div style={styles.pageTitle}>
        <h1 style={styles.title}>Your profile</h1>
        <p style={styles.subtitle}>Update your info to get better matched opportunities</p>
      </div>

      <div style={styles.grid}>
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Basic info</h3>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full name</label>
            <input
              style={{
                ...styles.input,
                borderColor: focused === 'name' ? '#064e3b' : '#e0e0e0',
                boxShadow: focused === 'name' ? '0 0 0 3px rgba(6,78,59,0.08)' : 'none',
              }}
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              onFocus={() => setFocused('name')}
              onBlur={() => setFocused(null)}
              placeholder="Your full name"
            />
          </div>

          <CustomSelect
            label="Grade"
            value={form.grade ? String(form.grade) : ''}
            options={GRADES.map(g => ({ value: String(g), label: `Grade ${g}` }))}
            onChange={val => setForm({ ...form, grade: val })}
          />

          <CustomSelect
            label="Province"
            value={form.province}
            options={PROVINCES.map(p => ({ value: p, label: `${PROVINCE_NAMES[p]} (${p})` }))}
            onChange={val => setForm({ ...form, province: val })}
          />

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

          <div style={styles.checkRow} onClick={() => setForm({ ...form, financial_need: !form.financial_need })}>
            <div style={{
              ...styles.checkbox,
              backgroundColor: form.financial_need ? '#064e3b' : '#fff',
              borderColor: form.financial_need ? '#064e3b' : '#d1d5db',
            }}>
              {form.financial_need && <span style={styles.checkmark}>✓</span>}
            </div>
            <div>
              <p style={styles.checkLabel}>I have financial need</p>
              <p style={styles.checkSub}>Unlocks need-based scholarships and grants</p>
            </div>
          </div>
        </div>

        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Interests</h3>
          <p style={styles.sectionSub}>These drive your AI matches — pick everything that applies</p>
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
                {form.interests.includes(interest) && <span style={{ marginRight: '4px' }}>✓</span>}
                {interest}
              </button>
            ))}
          </div>
          <p style={styles.selectedCount}>
            {form.interests.length} selected
          </p>
        </div>
      </div>

      <div style={styles.saveRow}>
        <p style={styles.saveHint}>Changes apply to your next AI match refresh</p>
        <button
          style={{
            ...styles.saveBtn,
            backgroundColor: saved ? '#f0fdf4' : '#064e3b',
            color: saved ? '#064e3b' : '#fff',
            border: saved ? '1.5px solid #6ee7b7' : 'none',
            opacity: loading ? 0.7 : 1,
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
    marginBottom: '20px',
    letterSpacing: '-0.2px',
  },
  sectionSub: {
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '16px',
    marginTop: '-14px',
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
  selectTrigger: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '11px 14px',
    borderRadius: '10px',
    border: '1.5px solid #e0e0e0',
    fontSize: '14px',
    fontFamily: 'inherit',
    backgroundColor: '#fafafa',
    color: '#111',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'left',
  },
  chevron: {
    fontSize: '13px',
    color: '#9ca3af',
    transition: 'transform 0.2s ease',
    display: 'inline-block',
    marginLeft: '8px',
  },
  backdrop: {
    position: 'fixed',
    inset: 0,
    zIndex: 9,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    border: '1.5px solid #e8e8e8',
    borderRadius: '12px',
    overflow: 'hidden',
    zIndex: 10,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    maxHeight: '220px',
    overflowY: 'auto',
    animation: 'fadeSlideIn 0.15s ease',
  },
  dropdownOption: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '10px 14px',
    border: 'none',
    fontSize: '13px',
    cursor: 'pointer',
    transition: 'background 0.1s ease',
    textAlign: 'left',
    fontFamily: 'inherit',
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
  selectedCount: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '12px',
  },
  checkRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    marginTop: '8px',
    cursor: 'pointer',
    padding: '12px',
    borderRadius: '10px',
    border: '1.5px solid #e5e7eb',
    transition: 'border-color 0.2s ease',
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
    marginTop: '1px',
  },
  checkmark: {
    color: '#fff',
    fontSize: '12px',
    fontWeight: '700',
  },
  checkLabel: {
    fontSize: '14px',
    color: '#374151',
    fontWeight: '600',
    margin: 0,
  },
  checkSub: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: '2px 0 0 0',
  },
  saveRow: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: '16px',
  },
  saveHint: {
    fontSize: '12px',
    color: '#9ca3af',
    margin: 0,
  },
  saveBtn: {
    padding: '12px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    letterSpacing: '-0.2px',
  },
}