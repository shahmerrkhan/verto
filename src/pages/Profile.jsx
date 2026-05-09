import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile } from '../lib/dbHelpers'
import OnboardingProgress from '../components/OnboardingProgress'
import { BadgeGrid } from '../components/Badges'
import { useLocation } from 'react-router-dom'
import MatchShareCard from '../components/MatchShareCard'
import { supabase } from '../lib/supabase'

const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research',
  'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics',
  'Medicine & Health', 'Environment & Sustainability', 'Education',
  'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]
const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
const PROVINCE_NAMES = { AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon' }
const GPA_RANGES = ['4.0', '3.5-3.9', '3.0-3.4', '2.5-2.9', 'Below 2.5', 'N/A']
const GRADES = [9, 10, 11, 12]

function CustomSelect({ label, value, options, onChange }) {
  const [open, setOpen] = useState(false)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
      <label style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '11px 14px', borderRadius: '8px', border: `1px solid ${open ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`, fontSize: '14px', fontFamily: 'inherit', backgroundColor: '#0d1117', color: '#e6edf3', cursor: 'pointer', transition: 'border-color 0.2s ease', textAlign: 'left' }}>
          <span>{value ? options.find(o => (typeof o === 'object' ? o.value : o) === value)?.label || value : `Select ${label.toLowerCase()}`}</span>
          <span style={{ fontSize: '11px', color: '#484f58', transform: open ? 'rotate(180deg)' : 'rotate(0)', display: 'inline-block', transition: 'transform 0.2s', marginLeft: '8px' }}>▾</span>
        </button>
        {open && (
          <>
            <div style={{ position: 'fixed', inset: 0, zIndex: 9 }} onClick={() => setOpen(false)} />
            <div style={{ position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', zIndex: 10, boxShadow: '0 12px 32px rgba(0,0,0,0.6)', maxHeight: '200px', overflowY: 'auto', animation: 'slideDown 0.15s ease' }}>
              {options.map(opt => {
                const v = typeof opt === 'object' ? opt.value : opt
                const l = typeof opt === 'object' ? opt.label : opt
                return (
                  <button key={v} onClick={() => { onChange(v); setOpen(false) }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 14px', border: 'none', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', backgroundColor: value === v ? 'rgba(245,158,11,0.08)' : 'transparent', color: value === v ? '#f59e0b' : '#e6edf3', fontWeight: value === v ? '700' : '400', transition: 'background 0.1s', textAlign: 'left' }}>
                    {l}{value === v && <span style={{ color: '#f59e0b', fontSize: '11px' }}>✓</span>}
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
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    grade: profile?.grade ? String(profile.grade) : '',
    province: profile?.province || '',
    interests: profile?.interests || [],
    gpa_range: profile?.gpa_range || '',
    financial_need: profile?.financial_need || false,
    email_alerts: profile?.email_alerts || false,
  })
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [focused, setFocused] = useState(null)
  const [counts, setCounts] = useState({ saves: 0, apps: 0 })
  const location = useLocation()
  const [showShareCard, setShowShareCard] = useState(false)
  const isNewUser = new URLSearchParams(location.search).get('new') === 'true'

  useEffect(() => {
    if (!user) return
    async function fetchCounts() {
      const [{ count: saveCount }, { count: appCount }] = await Promise.all([
        supabase.from('saves').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('applications').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      ])
      setCounts({ saves: saveCount || 0, apps: appCount || 0 })
    }
    fetchCounts()
  }, [user])

  function toggleInterest(interest) {
    setForm(prev => ({ ...prev, interests: prev.interests.includes(interest) ? prev.interests.filter(i => i !== interest) : [...prev.interests, interest] }))
  }

  async function handleSave() {
  const { validateProfile } = require('../lib/validation')
  
  const validation = validateProfile({
    full_name: form.full_name,
    grade: form.grade ? parseInt(form.grade) : null,
    province: form.province,
    interests: form.interests,
    gpa_range: form.gpa_range,
  })
  
  if (!validation.valid) {
    setToast({ message: validation.errors[0], type: 'error' })
    return
  }
  
  setLoading(true)
  const { error } = await updateProfile(user.id, {
    full_name: form.full_name,
    grade: parseInt(form.grade),
    province: form.province,
    interests: form.interests,
    gpa_range: form.gpa_range,
    financial_need: form.financial_need,
    email_alerts: form.email_alerts,
  })
  
  if (error) {
    setToast({ message: 'Failed to save profile', type: 'error' })
    setLoading(false)
    return
  }
  
  if (refreshProfile) await refreshProfile()
  setLoading(false)
  setSaved(true)
  setTimeout(() => setSaved(false), 2500)
  if (isNewUser) setShowShareCard(true)
}

  const inputStyle = (name) => ({
    padding: '11px 14px', borderRadius: '8px', border: `1px solid ${focused === name ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
    backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '14px', fontFamily: 'inherit',
    transition: 'border-color 0.2s ease', outline: 'none', boxSizing: 'border-box', width: '100%',
  })

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '96px 24px 80px', fontFamily: 'DM Sans, sans-serif', animation: 'fadeSlideIn 0.5s cubic-bezier(0.22,1,0.36,1)' }}>
      {showShareCard && (
        <MatchShareCard
          profile={{ ...form, grade: form.grade }}
          onClose={() => setShowShareCard(false)}
          onGoToDashboard={() => navigate('/dashboard')}
        />
      )}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#e6edf3', marginBottom: '6px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>Your profile</h1>
        <p style={{ fontSize: '14px', color: '#7d8590' }}>Update your info to get better matched opportunities</p>
        <OnboardingProgress currentStep={1} totalSteps={1} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Basic info */}
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', marginBottom: '20px', fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Basic info</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Full name</label>
            <input style={inputStyle('name')} value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} onFocus={() => setFocused('name')} onBlur={() => setFocused(null)} placeholder="Your full name" />
          </div>

          <CustomSelect label="Grade" value={form.grade} options={GRADES.map(g => ({ value: String(g), label: `Grade ${g}` }))} onChange={val => setForm({ ...form, grade: val })} />
          <CustomSelect label="Province" value={form.province} options={PROVINCES.map(p => ({ value: p, label: `${PROVINCE_NAMES[p]} (${p})` }))} onChange={val => setForm({ ...form, province: val })} />

          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.8px', display: 'block', marginBottom: '10px' }}>GPA range</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {GPA_RANGES.map(g => (
                <button key={g} onClick={() => setForm({ ...form, gpa_range: g })} style={{ padding: '6px 12px', borderRadius: '20px', border: '1px solid', borderColor: form.gpa_range === g ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: form.gpa_range === g ? 'rgba(245,158,11,0.1)' : 'transparent', color: form.gpa_range === g ? '#f59e0b' : '#7d8590', fontSize: '12px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' }}>
                  {g}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: 'financial_need', label: 'Financial need', sub: 'Unlocks need-based scholarships and grants' },
            { key: 'email_alerts', label: 'Email alerts for deadlines', sub: 'Get notified when saved opportunities close in 3 days' },
          ].map(item => (
            <div key={item.key} onClick={() => setForm({ ...form, [item.key]: !form[item.key] })} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', marginBottom: '8px', transition: 'border-color 0.2s', backgroundColor: 'rgba(255,255,255,0.02)' }}>
              <div style={{ width: '18px', height: '18px', borderRadius: '5px', border: `1.5px solid ${form[item.key] ? '#f59e0b' : 'rgba(255,255,255,0.15)'}`, backgroundColor: form[item.key] ? 'rgba(245,158,11,0.15)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '1px', transition: 'all 0.2s' }}>
                {form[item.key] && <span style={{ color: '#f59e0b', fontSize: '11px', fontWeight: '800' }}>✓</span>}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#e6edf3' }}>{item.label}</p>
                <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#484f58' }}>{item.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Interests */}
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', marginBottom: '4px', fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interests</h3>
          <p style={{ fontSize: '12px', color: '#484f58', marginBottom: '16px' }}>These drive your AI matches — pick everything that applies</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {INTERESTS.map(interest => (
              <button key={interest} onClick={() => toggleInterest(interest)} style={{ padding: '7px 13px', borderRadius: '20px', border: '1px solid', borderColor: form.interests.includes(interest) ? '#f59e0b' : 'rgba(255,255,255,0.08)', backgroundColor: form.interests.includes(interest) ? 'rgba(245,158,11,0.1)' : 'transparent', color: form.interests.includes(interest) ? '#f59e0b' : '#7d8590', fontSize: '12px', cursor: 'pointer', fontWeight: '600', transition: 'all 0.15s ease', fontFamily: 'inherit' }}>
                {form.interests.includes(interest) && <span style={{ marginRight: '4px', fontSize: '10px' }}>✓</span>}
                {interest}
              </button>
            ))}
          </div>
          <p style={{ fontSize: '11px', color: '#484f58', marginTop: '12px' }}>{form.interests.length} selected</p>
        </div>
      </div>

      {profile?.badges?.length > 0 && (
        <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: '24px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', marginBottom: '4px', fontFamily: "'Syne', sans-serif", textTransform: 'uppercase', letterSpacing: '0.5px' }}>Badges</h3>
          <p style={{ fontSize: '12px', color: '#484f58', marginBottom: '16px' }}>{profile.badges.length} earned so far</p>
          <BadgeGrid unlockedBadges={profile.badges} saveCount={counts.saves} appCount={counts.apps} />
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '16px' }}>
        <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>Changes apply to your next AI match refresh</p>
        <button onClick={handleSave} disabled={loading} style={{ padding: '11px 28px', borderRadius: '10px', border: saved ? '1px solid rgba(63,185,80,0.3)' : 'none', backgroundColor: saved ? 'rgba(63,185,80,0.1)' : '#f59e0b', color: saved ? '#3fb950' : '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Saving...' : saved ? '✓ Saved' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}