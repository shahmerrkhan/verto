import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Footer from '../components/Footer'
import { useResponsive } from '../config/responsive'

const PLANS = [
  {
    id: 'basic',
    name: 'Basic Listing',
    price: '$50/mo',
    color: '#58a6ff',
    bg: 'rgba(88,166,255,0.08)',
    border: 'rgba(88,166,255,0.2)',
    features: [
      'Listed in Verto opportunity feed',
      'AI-matched to qualified students',
      'Deadline alerts to saved students',
      'Basic applicant count tracking',
    ],
  },
  {
    id: 'featured',
    name: 'Featured Listing',
    price: '$120/mo',
    color: '#f59e0b',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.25)',
    badge: 'Most popular',
    features: [
      'Everything in Basic',
      'Priority placement in feed',
      '"Featured" badge on your listing',
      'Opportunity of the Day rotation',
      'Monthly applicant report',
    ],
  },
  {
    id: 'sponsored',
    name: 'Sponsored',
    price: '$250/mo',
    color: '#3fb950',
    bg: 'rgba(63,185,80,0.08)',
    border: 'rgba(63,185,80,0.2)',
    features: [
      'Everything in Featured',
      'Pinned to top of relevant searches',
      'Banner placement on dashboard',
      'Dedicated landing page on Verto',
      'Weekly applicant analytics',
      'Direct email to matched students',
    ],
  },
]

const STATS = [
  { value: '400+', label: 'Opportunities tracked' },
  { value: 'Canada', label: 'Focused audience' },
  { value: 'Grade 9–12', label: 'Student range' },
  { value: 'AI-matched', label: 'Every applicant' },
]

export default function ForOrganizers() {
  const { isMobile } = useResponsive()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    org_name: '',
    contact_name: '',
    contact_email: '',
    plan: 'basic',
    notes: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit() {
    if (!form.org_name.trim() || !form.contact_email.trim()) {
      setError('Organization name and email are required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      setError('Enter a valid email address.')
      return
    }

    setLoading(true)
    setError('')

    const res = await fetch('/api/organizer-listing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_name: form.org_name.trim(),
        contact_name: form.contact_name.trim() || null,
        contact_email: form.contact_email.trim(),
        plan: form.plan,
        notes: form.notes.trim() || null,
        monthly_fee: form.plan === 'basic' ? 50 : form.plan === 'featured' ? 120 : 250,
      }),
    })

    if (!res.ok) {
      setError('Something went wrong. Try again or email us directly.')
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

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0d1117', fontFamily: 'DM Sans, sans-serif' }}>
<div style={{ maxWidth: '900px', margin: '0 auto', padding: isMobile ? '48px 16px' : '80px 24px' }}>
        {/* Nav back */}
        <button
          onClick={() => navigate('/')}
          style={{ background: 'none', border: 'none', color: '#7d8590', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', marginBottom: '40px', padding: 0, display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          ← Back to Verto
        </button>

        {/* Hero */}
        <div style={{ marginBottom: '60px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', marginBottom: '16px' }}>
            <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px' }}>For Organizers</span>
          </div>
<h1 style={{ fontSize: isMobile ? '26px' : '36px', fontWeight: '800', color: '#e6edf3', margin: '0 0 16px', fontFamily: "'Syne', sans-serif", lineHeight: 1.15 }}>
              Reach students who are<br />
            <span style={{ color: '#f59e0b' }}>actually ready to apply.</span>
          </h1>
          <p style={{ fontSize: '16px', color: '#7d8590', margin: '0 0 32px', lineHeight: 1.6, maxWidth: '580px' }}>
            Verto connects Canadian high school students to scholarships, competitions, and programs — filtered by grade, province, GPA, and interests. When you list on Verto, your opportunity reaches students who qualify and are actively looking.
          </p>

          {/* Stats */}
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '12px' }}>
              {STATS.map(s => (
              <div key={s.label} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ fontSize: '18px', fontWeight: '800', color: '#e6edf3', fontFamily: "'Syne', sans-serif" }}>{s.value}</div>
                <div style={{ fontSize: '11px', color: '#484f58', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', marginTop: '3px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Verto for organizers */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', margin: '0 0 24px', fontFamily: "'Syne', sans-serif" }}>
            Why list on Verto?
          </h2>
<div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
              {[
              { icon: '🎯', title: 'Pre-qualified applicants', desc: "Every student sees your listing because our AI matched them to it based on grade, province, and interests. No random traffic." },
              { icon: '📊', title: 'Real applicant data', desc: "See how many students saved your opportunity, how many applied, and track engagement over your listing period." },
              { icon: '⏰', title: 'Deadline-aware nudges', desc: "Students who save your listing get automatic alerts as your deadline approaches. Less drop-off, more completed applications." },
              { icon: '🏆', title: 'Leaderboard visibility', desc: "When students win or are finalists for your competition, they appear on Verto's Winners Leaderboard — free publicity for your program." },
              { icon: '🇨🇦', title: 'Canada-only audience', desc: "Every student on Verto is Canadian. No filtering out international applicants on your end." },
              { icon: '💬', title: 'Zero setup required', desc: "Send us your opportunity details and we handle the listing. You focus on running your program." },
            ].map(item => (
              <div key={item.title} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '20px' }}>
                <div style={{ fontSize: '22px', marginBottom: '10px' }}>{item.icon}</div>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#e6edf3', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>{item.title}</h3>
                <p style={{ fontSize: '13px', color: '#7d8590', margin: 0, lineHeight: 1.5 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Plans */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
            Simple pricing
          </h2>
          <p style={{ fontSize: '14px', color: '#7d8590', margin: '0 0 24px' }}>No contracts. Cancel anytime. First month free for new listings.</p>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
            {PLANS.map(plan => (
              <div key={plan.id} style={{ backgroundColor: '#161b22', border: `1px solid ${plan.border}`, borderRadius: '14px', padding: '24px', position: 'relative' }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-10px', left: '20px', padding: '3px 10px', borderRadius: '10px', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {plan.badge}
                  </div>
                )}
                <div style={{ fontSize: '15px', fontWeight: '700', color: plan.color, marginBottom: '4px', fontFamily: "'Syne', sans-serif" }}>{plan.name}</div>
                <div style={{ fontSize: '28px', fontWeight: '800', color: '#e6edf3', marginBottom: '16px', fontFamily: "'Syne', sans-serif" }}>{plan.price}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {plan.features.map(f => (
                    <div key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '13px', color: '#7d8590' }}>
                      <span style={{ color: plan.color, fontWeight: '700', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact form */}
<div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '16px', padding: isMobile ? '20px 16px' : '36px' }}>
            {submitted ? (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
                We got your request.
              </h3>
              <p style={{ fontSize: '14px', color: '#7d8590', margin: '0 0 24px' }}>
                We'll reach out to {form.contact_email} within 24 hours to get your listing live.
              </p>
              <button
                onClick={() => navigate('/dashboard')}
                style={{ padding: '10px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Back to dashboard
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 6px', fontFamily: "'Syne', sans-serif" }}>
                Get your opportunity listed
              </h2>
              <p style={{ fontSize: '13px', color: '#7d8590', margin: '0 0 28px' }}>
                Fill this out and we'll get back to you within 24 hours.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                      Organization name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Regeneron, Loran Scholars Foundation"
                      value={form.org_name}
                      onChange={e => handleChange('org_name', e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                      Your name
                    </label>
                    <input
                      type="text"
                      placeholder="First and last name"
                      value={form.contact_name}
                      onChange={e => handleChange('contact_name', e.target.value)}
                      style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                    Contact email *
                  </label>
                  <input
                    type="email"
                    placeholder="you@organization.com"
                    value={form.contact_email}
                    onChange={e => handleChange('contact_email', e.target.value)}
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {/* Plan selector */}
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '8px' }}>
                    Plan
                  </label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {PLANS.map(plan => (
                      <button
                        key={plan.id}
                        onClick={() => handleChange('plan', plan.id)}
                        style={{
                          padding: '8px 16px', borderRadius: '8px', cursor: 'pointer',
                          border: `1px solid ${form.plan === plan.id ? plan.border : 'rgba(255,255,255,0.08)'}`,
                          backgroundColor: form.plan === plan.id ? plan.bg : 'transparent',
                          color: form.plan === plan.id ? plan.color : '#7d8590',
                          fontSize: '13px', fontWeight: '600', fontFamily: 'inherit',
                          transition: 'all 0.15s',
                        }}
                      >
                        {plan.name} — {plan.price}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                    Tell us about your opportunity (optional)
                  </label>
                  <textarea
                    placeholder="Brief description, deadline, eligibility, prize amount..."
                    value={form.notes}
                    onChange={e => handleChange('notes', e.target.value)}
                    rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = 'rgba(245,158,11,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                  />
                </div>

                {error && (
                  <p style={{ color: '#f85149', fontSize: '13px', margin: 0 }}>{error}</p>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    padding: '12px 28px', minHeight: '44px', borderRadius: '10px', border: 'none',
                    backgroundColor: loading ? '#21262d' : '#f59e0b',
                    color: loading ? '#484f58' : '#0d1117',
                    fontSize: '14px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: 'inherit', alignSelf: isMobile ? 'stretch' : 'flex-start', transition: 'all 0.15s',
                  }}
                >
                  {loading ? 'Submitting...' : 'Request a listing →'}
                </button>

                <p style={{ fontSize: '12px', color: '#484f58', margin: 0 }}>
                  First month is free. No payment info needed to get started.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}