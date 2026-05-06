import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'

export default function ApplyModal({ opportunity, onClose, onApplied }) {
  const { user, profile } = useAuth()
  const [step, setStep] = useState(1) // 1 = review info, 2 = confirmation
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const fields = [
    { label: 'Full name', value: profile?.full_name, missing: !profile?.full_name },
    { label: 'Grade', value: profile?.grade ? `Grade ${profile.grade}` : null, missing: !profile?.grade },
    { label: 'Province', value: profile?.province, missing: !profile?.province },
    { label: 'GPA range', value: profile?.gpa_range, missing: !profile?.gpa_range },
    { label: 'Interests', value: profile?.interests?.length > 0 ? profile.interests.slice(0, 3).join(', ') + (profile.interests.length > 3 ? ` +${profile.interests.length - 3} more` : '') : null, missing: !profile?.interests?.length },
  ]

  const missingCount = fields.filter(f => f.missing).length

  async function handleApply() {
    setLoading(true)

    // Track application in Supabase
    await supabase.from('applications').upsert({
      user_id: user.id,
      opportunity_id: opportunity.id,
      applied_at: new Date().toISOString(),
    }, { onConflict: 'user_id,opportunity_id' })

    await supabase.from('save_metadata').upsert({
      user_id: user.id,
      opportunity_id: opportunity.id,
      is_applied: true,
      outcome: 'pending',
      notes: notes || null,
    }, { onConflict: 'user_id,opportunity_id' })

    // Open the external site
    window.open(opportunity.url, '_blank')

    setLoading(false)
    setStep(2)
    onApplied && onApplied(opportunity.id)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 9999, padding: '24px',
      fontFamily: 'DM Sans, sans-serif',
    }} onClick={onClose}>
      <div style={{
        background: '#161b22', border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px', padding: '28px', maxWidth: '500px',
        width: '100%', position: 'relative',
      }} onClick={e => e.stopPropagation()}>

        <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', color: '#484f58', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>✕</button>

        {step === 1 ? (
          <>
            {/* Header */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '6px' }}>
                Applying to
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#e6edf3', margin: '0 0 4px', fontFamily: "'Syne', sans-serif" }}>
                {opportunity.title}
              </h2>
              <p style={{ fontSize: '13px', color: '#7d8590', margin: 0 }}>{opportunity.org_name}</p>
            </div>

            {/* Profile review */}
            <div style={{ backgroundColor: '#0d1117', borderRadius: '12px', padding: '16px', marginBottom: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#7d8590', margin: 0, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Your profile info
                </p>
                {missingCount > 0 && (
                  <span style={{ fontSize: '11px', color: '#f85149', fontWeight: '600' }}>
                    {missingCount} field{missingCount > 1 ? 's' : ''} missing
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {fields.map(field => (
                  <div key={field.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#484f58', fontWeight: '600' }}>{field.label}</span>
                    {field.missing ? (
                      <span style={{ fontSize: '12px', color: '#f85149', fontWeight: '600' }}>Not set</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#e6edf3', fontWeight: '500', maxWidth: '250px', textAlign: 'right', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {field.value}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {missingCount > 0 && (
                <a href="/profile" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '12px', fontSize: '12px', color: '#f59e0b', fontWeight: '600', textDecoration: 'none' }}>
                  Complete your profile → (opens in new tab)
                </a>
              )}
            </div>

            {/* Eligibility check */}
            {opportunity.eligibility_notes && (
              <div style={{ backgroundColor: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px' }}>Eligibility</p>
                <p style={{ fontSize: '12px', color: '#b1bac4', margin: 0, lineHeight: 1.5 }}>{opportunity.eligibility_notes}</p>
              </div>
            )}

            {/* Notes */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: '700', color: '#484f58', textTransform: 'uppercase', letterSpacing: '0.7px', marginBottom: '6px' }}>
                Private notes (optional)
              </label>
              <textarea
                placeholder="e.g. Need to ask teacher for reference letter, essay topic ideas..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: '#0d1117', color: '#e6edf3', fontSize: '13px', fontFamily: 'inherit', resize: 'vertical', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            {/* What happens next */}
            <p style={{ fontSize: '12px', color: '#484f58', margin: '0 0 16px', lineHeight: 1.5 }}>
              Clicking "Apply now" will open the official application page in a new tab and mark this as applied in your Verto pipeline.
            </p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#7d8590', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={loading}
                style={{ flex: 2, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: loading ? '#21262d' : '#f59e0b', color: loading ? '#484f58' : '#0d1117', fontSize: '13px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}
              >
                {loading ? 'Opening...' : 'Apply now →'}
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation step */}
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🎯</div>
              <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#e6edf3', margin: '0 0 8px', fontFamily: "'Syne', sans-serif" }}>
                Application tracked!
              </h3>
              <p style={{ fontSize: '14px', color: '#7d8590', margin: '0 0 24px', lineHeight: 1.6 }}>
                We've opened the official page and saved this to your pipeline. Log your outcome when you hear back.
              </p>

              <div style={{ backgroundColor: '#0d1117', borderRadius: '12px', padding: '16px', marginBottom: '24px', border: '1px solid rgba(255,255,255,0.06)', textAlign: 'left' }}>
                <p style={{ fontSize: '12px', fontWeight: '700', color: '#7d8590', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px' }}>Next steps</p>
                {[
                  'Complete the application on the official page',
                  'Check your Saved tab to track your status',
                  'Log your outcome when you hear back — wins go on the leaderboard',
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', minWidth: '16px', paddingTop: '1px' }}>{i + 1}.</span>
                    <span style={{ fontSize: '13px', color: '#b1bac4', lineHeight: 1.5 }}>{step}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={onClose} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)', backgroundColor: 'transparent', color: '#7d8590', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Close
                </button>
                <button onClick={() => window.open(opportunity.url, '_blank')} style={{ flex: 1, padding: '11px', borderRadius: '10px', border: 'none', backgroundColor: '#f59e0b', color: '#0d1117', fontSize: '13px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Back to application →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}