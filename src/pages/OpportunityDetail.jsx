import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from '../components/Footer'
import SimilarOpportunities from '../components/SimilarOpportunities'

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  useEffect(() => { fetchOpportunity() }, [id])

  async function fetchOpportunity() {
    try {
      const { data, error } = await supabase.from('opportunities').select('*').eq('id', id).single()
      if (error) throw error
      setOpportunity(data); setLoading(false)
      if (user) { checkSaved(); checkApplied() }
    } catch (error) { console.error('Error fetching opportunity:', error); setLoading(false) }
  }

  async function checkSaved() {
    const { data } = await supabase.from('saves').select('id').eq('user_id', user.id).eq('opportunity_id', id)
    setIsSaved(data && data.length > 0)
  }

  async function checkApplied() {
    const { data } = await supabase.from('applications').select('id').eq('user_id', user.id).eq('opportunity_id', id)
    setIsApplied(data && data.length > 0)
  }

  async function toggleSave() {
    if (isSaved) { await supabase.from('saves').delete().eq('user_id', user.id).eq('opportunity_id', id); setIsSaved(false) }
    else { await supabase.from('saves').insert({ user_id: user.id, opportunity_id: id }); setIsSaved(true) }
  }

  async function trackApplication() {
    if (!isApplied) { await supabase.from('applications').insert({ user_id: user.id, opportunity_id: id }); setIsApplied(true) }
  }

  if (loading) return <div style={{ padding: '120px 20px', textAlign: 'center', color: '#7d8590', backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>Loading...</div>
  if (!opportunity) return <div style={{ padding: '120px 20px', textAlign: 'center', color: '#7d8590', backgroundColor: '#0d1117', minHeight: '100vh' }}>Not found</div>

  const daysUntilDeadline = opportunity.deadline ? Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24)) : null

  const typeColors = { scholarship: { bg: 'rgba(63,185,80,0.1)', color: '#3fb950' }, competition: { bg: 'rgba(99,102,241,0.1)', color: '#818cf8' }, internship: { bg: 'rgba(245,158,11,0.1)', color: '#f59e0b' }, program: { bg: 'rgba(168,85,247,0.1)', color: '#c084fc' }, grant: { bg: 'rgba(248,81,73,0.1)', color: '#f85149' } }
  const tc = typeColors[opportunity.type] || { bg: 'rgba(125,133,144,0.1)', color: '#7d8590' }

  return (
    <div style={{ backgroundColor: '#0d1117', minHeight: '100vh', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 40px' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#f59e0b', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '4px', fontFamily: 'inherit', padding: 0 }}>← Back</button>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px', marginBottom: '40px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.6px', backgroundColor: tc.bg, color: tc.color, display: 'inline-block', marginBottom: '12px' }}>{opportunity.type}</span>
            <h1 style={{ fontSize: 'clamp(24px, 3vw, 32px)', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', letterSpacing: '-0.5px', fontFamily: "'Syne', sans-serif" }}>{opportunity.title}</h1>
            <p style={{ fontSize: '15px', fontWeight: '500', color: '#7d8590', margin: 0 }}>{opportunity.org_name}</p>
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button onClick={toggleSave} style={{ padding: '11px 20px', borderRadius: '10px', border: `1px solid ${isSaved ? 'rgba(245,158,11,0.3)' : 'rgba(255,255,255,0.1)'}`, backgroundColor: isSaved ? 'rgba(245,158,11,0.1)' : 'transparent', color: isSaved ? '#f59e0b' : '#7d8590', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button onClick={() => { window.open(opportunity.url, '_blank'); trackApplication() }} style={{ padding: '11px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', fontFamily: 'inherit' }}>
              Apply Now →
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '28px' }}>
          <div>
            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Syne', sans-serif" }}>Overview</h2>
              <p style={{ fontSize: '15px', color: '#b1bac4', lineHeight: 1.65, margin: 0 }}>{opportunity.description}</p>
            </div>

            <div style={{ marginBottom: '32px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: '800', color: '#e6edf3', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Syne', sans-serif" }}>Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px' }}>
                {[
                  opportunity.type && { label: 'Type', value: opportunity.type },
                  opportunity.amount && { label: 'Award', value: `$${opportunity.amount.toLocaleString()}`, highlight: true },
                  daysUntilDeadline !== null && { label: 'Deadline', value: `${new Date(opportunity.deadline).toLocaleDateString()} (${daysUntilDeadline}d left)` },
                  opportunity.eligibility_notes && { label: 'Eligibility', value: opportunity.eligibility_notes },
                ].filter(Boolean).map((item, i) => (
                  <div key={i} style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '14px 16px' }}>
                    <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{item.label}</p>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: item.highlight ? '#3fb950' : '#e6edf3' }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '80px', alignSelf: 'flex-start' }}>
            <div style={{ backgroundColor: '#161b22', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '14px', padding: '20px' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '800', color: '#e6edf3', margin: '0 0 16px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.06)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: "'Syne', sans-serif" }}>Key Info</h3>

              {[
                opportunity.provider && { label: 'Provider', value: opportunity.provider },
                opportunity.grade_scope && { label: 'Grade Scope', value: Array.isArray(opportunity.grade_scope) ? opportunity.grade_scope.map(g => `Grade ${g}`).join(', ') : String(opportunity.grade_scope) },
                opportunity.province_scope && { label: 'Province', value: Array.isArray(opportunity.province_scope) ? opportunity.province_scope.join(', ') : String(opportunity.province_scope) },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{item.label}</p>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#e6edf3' }}>{item.value}</p>
                </div>
              ))}

              {opportunity.interest_tags && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ margin: '0 0 8px', fontSize: '10px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Interests</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {(Array.isArray(opportunity.interest_tags) ? opportunity.interest_tags : opportunity.interest_tags.split(',')).map((tag, i) => (
                      <span key={i} style={{ padding: '4px 9px', borderRadius: '6px', fontSize: '11px', fontWeight: '600', backgroundColor: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>{tag.trim()}</span>
                    ))}
                  </div>
                </div>
              )}

              <button onClick={() => window.open(opportunity.url, '_blank')} style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#fbbf24'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}>
                Visit Official Page →
              </button>
            </div>
          </div>
        </div>
        <SimilarOpportunities currentId={id} type={opportunity.type} />
      </div>
      <Footer />
    </div>
  )
}