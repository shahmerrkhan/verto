import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research',
  'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics',
  'Medicine & Health', 'Environment & Sustainability', 'Education',
  'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]

const PROVINCES = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
const GPA_RANGES = ['4.0', '3.5-3.9', '3.0-3.4', '2.5-2.9', 'Below 2.5', 'N/A']

const STEPS = ['name', 'grade', 'province', 'gpa', 'interests', 'finish']

export default function Onboarding() {
  const { user, profile, refreshProfile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    grade: profile?.grade || '',
    province: profile?.province || '',
    interests: profile?.interests || [],
    gpa_range: profile?.gpa_range || '',
    financial_need: profile?.financial_need || false,
  })

  function next() { setStep(s => Math.min(s + 1, STEPS.length - 1)) }
  function back() { setStep(s => Math.max(s - 1, 0)) }

  function toggleInterest(interest) {
    setForm(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  async function finish() {
    setSaving(true)
      await fetch('/api/profile?action=update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        full_name: form.full_name,
        grade: parseInt(form.grade) || null,
        province: form.province,
        interests: form.interests,
        gpa_range: form.gpa_range,
        financial_need: form.financial_need,
      }),
    })
    await refreshProfile()
    setSaving(false)
    navigate('/dashboard')
  }

  const current = STEPS[step]

  const wrap = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-base)',
    fontFamily: 'var(--font-sans)',
    padding: '24px',
  }

  const card = {
    width: '100%',
    maxWidth: '480px',
    textAlign: 'center',
  }

  const question = {
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
    marginBottom: '28px',
    letterSpacing: '-0.5px',
  }

  const input = {
    width: '100%',
    padding: '16px 18px',
    fontSize: '18px',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-strong)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    textAlign: 'center',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const primaryBtn = {
    marginTop: '24px',
    padding: '14px 36px',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    backgroundColor: 'var(--accent-violet)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    fontFamily: 'inherit',
  }

  const chip = (active) => ({
    padding: '10px 18px',
    borderRadius: '999px',
    border: '1px solid',
    borderColor: active ? 'var(--accent-violet)' : 'var(--border-strong)',
    backgroundColor: active ? 'var(--accent-violet)' : 'transparent',
    color: active ? '#fff' : 'var(--text-secondary)',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '4px',
    fontFamily: 'inherit',
  })

  const slideVariants = {
    enter: { opacity: 0, y: 16 },
    center: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 },
  }

  function canAdvance() {
    if (current === 'name') return form.full_name.trim().length > 0
    if (current === 'grade') return !!form.grade
    if (current === 'province') return !!form.province
    if (current === 'gpa') return !!form.gpa_range
    return true
  }

  return (
    <div style={wrap}>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '48px' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            width: '32px',
            height: '4px',
            borderRadius: '2px',
            backgroundColor: i <= step ? 'var(--accent-violet)' : 'var(--border-default)',
            transition: 'background-color 0.3s ease',
          }} />
        ))}
      </div>

      <div style={card}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {current === 'name' && (
              <>
                <h1 style={question}>What's your name?</h1>
                <input
                  style={input}
                  autoFocus
                  value={form.full_name}
                  onChange={e => setForm({ ...form, full_name: e.target.value })}
                  onKeyDown={e => e.key === 'Enter' && canAdvance() && next()}
                  placeholder="Your full name"
                />
              </>
            )}

            {current === 'grade' && (
              <>
                <h1 style={question}>What grade are you in, {form.full_name.split(' ')[0]}?</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {['9', '10', '11', '12'].map(g => (
                    <button key={g} style={chip(form.grade === g)} onClick={() => { setForm({ ...form, grade: g }); setTimeout(next, 200) }}>
                      Grade {g}
                    </button>
                  ))}
                </div>
              </>
            )}

            {current === 'province' && (
              <>
                <h1 style={question}>Which province?</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {PROVINCES.map(p => (
                    <button key={p} style={chip(form.province === p)} onClick={() => { setForm({ ...form, province: p }); setTimeout(next, 200) }}>
                      {p}
                    </button>
                  ))}
                </div>
              </>
            )}

            {current === 'gpa' && (
              <>
                <h1 style={question}>What's your GPA range?</h1>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {GPA_RANGES.map(g => (
                    <button key={g} style={chip(form.gpa_range === g)} onClick={() => { setForm({ ...form, gpa_range: g }); setTimeout(next, 200) }}>
                      {g}
                    </button>
                  ))}
                </div>
              </>
            )}

            {current === 'interests' && (
              <>
                <h1 style={question}>What are you into?</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '20px' }}>Pick as many as you like, this drives your matches</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                  {INTERESTS.map(i => (
                    <button key={i} style={chip(form.interests.includes(i))} onClick={() => toggleInterest(i)}>
                      {i}
                    </button>
                  ))}
                </div>
                <button style={primaryBtn} onClick={next}>Continue</button>
              </>
            )}

            {current === 'finish' && (
              <>
                <h1 style={question}>You're all set, {form.full_name.split(' ')[0]}.</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>We'll use this to match you with opportunities that actually fit.</p>
                <button style={primaryBtn} onClick={finish} disabled={saving}>
                  {saving ? 'Saving...' : 'Enter Verto →'}
                </button>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        {current !== 'interests' && current !== 'finish' && (
          <button
            style={{ ...primaryBtn, display: canAdvance() && (current === 'name') ? 'inline-block' : 'none' }}
            onClick={next}
          >
            Continue
          </button>
        )}

        {step > 0 && current !== 'finish' && (
          <div style={{ marginTop: '20px' }}>
            <button onClick={back} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit' }}>
              ← Back
            </button>
          </div>
        )}
      </div>
    </div>
  )
}