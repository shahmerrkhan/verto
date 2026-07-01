import { useState } from 'react'
import Footer from '../components/Footer'
import { useResponsive } from '../config/responsive'

const SKILLS = [
  'Essay Writing', 'Interview Prep', 'Research Methods', 'Coding & Algorithms',
  'Math Olympiad Prep', 'Science Fair Projects', 'Business Planning', 'Public Speaking',
  'Scholarship Applications', 'University Admissions', 'Debate', 'Film & Media',
  'Environmental Science', 'Biotech & Lab Research', 'Financial Literacy', 'Leadership'
]

const OPPORTUNITY_TYPES = ['scholarship', 'competition', 'internship', 'program', 'grant']

const INTEREST_TAGS = [
  'Software & Tech', 'Engineering', 'Science & Research',
  'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics',
  'Medicine & Health', 'Environment & Sustainability', 'Education',
  'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]

export default function Mentors() {
  const { isMobile } = useResponsive()
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    linkedin_url: '',
    bio: '',
    role: '',
    institution: '',
    skills: [],
    opportunity_types: [],
    interest_tags: [],
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function toggle(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  async function handleSubmit() {
    if (!form.full_name.trim() || !form.email.trim() || !form.bio.trim() || !form.role.trim()) {
      setError('Please fill in all required fields.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Enter a valid email address.')
      return
    }
    if (form.skills.length === 0) {
      setError('Select at least one skill you can teach.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/mentors?action=apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        linkedin_url: form.linkedin_url.trim() || null,
        bio: form.bio.trim(),
        role: form.role.trim(),
        institution: form.institution.trim() || null,
        skills: form.skills,
        opportunity_types: form.opportunity_types,
        interest_tags: form.interest_tags,
      }),
    })

    if (!res.ok) {
      setError('Something went wrong. Try again.')
      setLoading(false)
      return
    }

    setSubmitted(true)
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117',
    color: '#e6edf3', fontSize: '13px', fontFamily: 'inherit',
    outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s',
  }

  const pillStyle = (active, color = '#f59e0b') => ({
    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer',
    border: `1px solid ${active ? color : 'rgba(255,255,255,0.08)'}`,
    backgroundColor: active ? `${color}15` : 'transparent',
    color: active ? color : '#7d8590',
    fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
    transition: 'all 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', fontFamily: 'DM Sans, sans-serif' }}>
<div style={{ maxWidth: '720px', margin: '0 auto', padding: isMobile ? '80px 16px 60px' : '96px 24px 80px' }}>
        {/* Header */}
        <div style={{ marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Become a Mentor</span>
          </div>
<h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '800', color: '#e6edf3', margin: '0 0 12px', fontFamily: "'Syne', sans-serif", lineHeight: 1.2 }}>
              Host a session.<br />Help students win.
          </h1>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: 0, lineHeight: 1.6, maxWidth: '520px' }}>
            Share a skill, host a 30-60 minute group session, and help Canadian students land scholarships, competitions, and programs. You set the topic, the time, and the platform. We bring the students.
          </p>
        </div>

        {/* How it works */}
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: '12px', marginBottom: '40px' }}>
            {[
            { icon: '📝', title: 'Apply', desc: 'Fill out this form. We review and approve within 48 hours.' },
            { icon: '🗓️', title: 'Schedule', desc: 'Pick a topic, set a date, and share your meeting link.' },
            { icon: '🎯', title: 'Impact', desc: 'Students who need your session get notified automatically.' },
          ].map(step => (
            <div key={step.title} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{step.icon}</div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>{step.title}</p>
              <p style={{ fontSize: '12px', color: '#7d8590', margin: 0, lineHeight: 1.5 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {submitted ? (
          <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(63,185,80,0.2)', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>Application received.</h3>
            <p style={{ fontSize: '14px', color: '#7d8590', margin: 0 }}>We'll review your application and get back to you at {form.email} within 48 hours.</p>
          </div>
        ) : (
<div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: isMobile ? '16px' : '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '800', color: '#e6edf3', margin: 0, fontFamily: "'Syne', sans-serif" }}>Your application</h2>

            {/* Name + Email */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>Full name *</label>

                <input style={inputStyle} placeholder="Your full name" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>Email *</label>
                <input style={inputStyle} placeholder="you@email.com" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* Role + Institution */}
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>Your role *</label>

                <input style={inputStyle} placeholder="e.g. CS student at Waterloo, Software Engineer" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>School or company</label>
                <input style={inputStyle} placeholder="e.g. University of Waterloo" value={form.institution} onChange={e => setForm({ ...form, institution: e.target.value })}
                  onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
              </div>
            </div>

            {/* LinkedIn */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>LinkedIn URL</label>
              <input style={inputStyle} placeholder="https://linkedin.com/in/yourname" value={form.linkedin_url} onChange={e => setForm({ ...form, linkedin_url: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            {/* Bio */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>Your background and why you want to mentor *</label>
              <textarea style={{ ...inputStyle, resize: 'vertical' }} rows={4}
                placeholder="Tell us about your experience, what you've won or built, and why you want to help students..."
                value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}
                onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'} />
            </div>

            {/* Skills */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>Skills you can teach * <span style={{ color: '#484f58', fontWeight: '400', textTransform: 'none' }}>(pick all that apply)</span></label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {SKILLS.map(s => (
                  <button key={s} onClick={() => toggle('skills', s)} style={pillStyle(form.skills.includes(s))}>{s}</button>
                ))}
              </div>
            </div>

            {/* Opportunity types */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>Opportunity types you can help with</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {OPPORTUNITY_TYPES.map(t => (
                  <button key={t} onClick={() => toggle('opportunity_types', t)} style={pillStyle(form.opportunity_types.includes(t), '#818cf8')}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Interest tags */}
            <div>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '10px' }}>Subject areas</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {INTEREST_TAGS.map(t => (
                  <button key={t} onClick={() => toggle('interest_tags', t)} style={pillStyle(form.interest_tags.includes(t), '#3fb950')}>{t}</button>
                ))}
              </div>
            </div>

            {error && <p style={{ color: '#f85149', fontSize: '13px', margin: 0 }}>{error}</p>}

            <button onClick={handleSubmit} disabled={loading} style={{
              padding: '13px', minHeight: '44px', borderRadius: '10px', border: 'none',
              backgroundColor: loading ? '#21262d' : '#f59e0b',
              color: loading ? '#484f58' : '#0d1117',
              fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>
              {loading ? 'Submitting...' : 'Apply to be a mentor →'}
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}