import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import Footer from '../components/Footer'
import SimilarOpportunities from '../components/SimilarOpportunities'
import RelatedCourses from '../components/RelatedCourses'
import UpcomingSessions from '../components/UpcomingSessions'
import {
  saveOpportunity,
  unsaveOpportunity,
  trackApplication,
  logView,
} from '../lib/db'

const TYPE_COLORS = {
  scholarship: { bg: 'var(--success-muted)', color: 'var(--success)' },
  competition: { bg: 'var(--accent-violet-muted)', color: 'var(--accent-violet)' },
  internship: { bg: 'var(--warning-muted)', color: 'var(--warning)' },
  program: { bg: 'var(--accent-violet-muted)', color: 'var(--accent-violet)' },
  grant: { bg: 'var(--danger-muted)', color: 'var(--danger)' },
}

function getDaysUntil(deadline) {
  if (!deadline) return null
  return Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
}

function DeadlineBadge({ days }) {
  if (days === null) return null
  const color = days <= 7 ? 'var(--danger)' : days <= 30 ? 'var(--warning)' : 'var(--success)'
  const bg = days <= 7 ? 'var(--danger-muted)' : days <= 30 ? 'var(--warning-muted)' : 'var(--success-muted)'
  const label = days < 0 ? 'Closed' : days === 0 ? 'Due today' : `${days}d left`
  return (
    <span style={{
      padding: '4px 10px',
      borderRadius: 'var(--radius-sm)',
      fontSize: '11px',
      fontWeight: '700',
      backgroundColor: bg,
      color,
      fontFamily: 'var(--font-sans)',
    }}>
      {label}
    </span>
  )
}

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isApplied, setIsApplied] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [toast, setToast] = useState(null)

  // Plain English: fetch the single opportunity by its ID from our API,
  // then check if the user has saved or applied to it
  const fetchOpportunity = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/opportunities?action=detail&id=${id}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      // The API returns an array, we want just the first (and only) item
      const opp = Array.isArray(data) ? data.find(o => String(o.id) === String(id)) : data
      setOpportunity(opp || null)

      if (user && opp) {
        // Log that this user viewed this opportunity (for analytics)
        logView(user.id, opp.id).catch(() => {})

        // Check saved and applied status in parallel (both at the same time)
        const [savesRes, appsRes] = await Promise.all([
          fetch(`/api/saves?userId=${user.id}`),
          fetch(`/api/applications?userId=${user.id}`),
        ])
        const saves = (await savesRes.json()).data
        const apps = (await appsRes.json()).data
        setIsSaved(Array.isArray(saves) && saves.includes(Number(id)))
        setIsApplied(Array.isArray(apps) && apps.includes(Number(id)))
      }
    } catch (err) {
      console.error('Error fetching opportunity:', err)
      setOpportunity(null)
    } finally {
      setLoading(false)
    }
  }

  // Run fetchOpportunity whenever the ID in the URL changes
  useEffect(() => {
    void fetchOpportunity()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  function showToast(message, type = 'success') {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  async function toggleSave() {
    if (!user || saveLoading) return
    setSaveLoading(true)
    const wasSaved = isSaved
    setIsSaved(!wasSaved)
    try {
      if (wasSaved) {
        await unsaveOpportunity(user.id, Number(id))
        showToast('Removed from saves', 'info')
      } else {
        await saveOpportunity(user.id, Number(id))
        showToast('Saved!', 'success')
      }
    } catch {
      setIsSaved(wasSaved) // revert if something went wrong
      showToast('Something went wrong', 'error')
    } finally {
      setSaveLoading(false)
    }
  }

  async function handleTrackApplication() {
    if (!user || isApplied) return
    setIsApplied(true)
    try {
      await trackApplication(user.id, Number(id))
      showToast('Application tracked!', 'success')
    } catch {
      setIsApplied(false)
      showToast('Something went wrong', 'error')
    }
  }

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
    }}>
      <div style={{
        width: '28px', height: '28px',
        border: '2px solid var(--accent-violet-muted)',
        borderTopColor: 'var(--accent-violet)',
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
    </div>
  )

  if (!opportunity) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--bg-base)',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
        Opportunity not found
      </p>
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 20px',
          borderRadius: 'var(--radius-md)',
          border: 'none',
          backgroundColor: 'var(--accent-violet)',
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
          cursor: 'pointer',
          fontFamily: 'var(--font-sans)',
        }}
      >
        Back to dashboard
      </button>
    </div>
  )

  const daysLeft = getDaysUntil(opportunity.deadline)
  const tc = TYPE_COLORS[opportunity.type] || { bg: 'var(--bg-elevated)', color: 'var(--text-secondary)' }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-base)',
      fontFamily: 'var(--font-sans)',
    }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 60px' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontFamily: 'var(--font-sans)',
            padding: 0,
            transition: 'color var(--transition)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          ← Back
        </button>

        {/* Main layout: content left, action panel right */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 320px',
          gap: '32px',
          alignItems: 'start',
        }}>

          {/* LEFT: main content */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Type badge + title */}
            <div style={{ marginBottom: '32px' }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
                backgroundColor: tc.bg,
                color: tc.color,
                display: 'inline-block',
                marginBottom: '12px',
                fontFamily: 'var(--font-sans)',
              }}>
                {opportunity.type}
              </span>
              <h1 style={{
                fontSize: 'clamp(22px, 3vw, 30px)',
                fontWeight: '800',
                color: 'var(--text-primary)',
                margin: '0 0 8px',
                letterSpacing: '-0.5px',
                fontFamily: 'var(--font-display)',
                lineHeight: 1.2,
              }}>
                {opportunity.title}
              </h1>
              <p style={{ fontSize: '15px', fontWeight: '500', color: 'var(--text-secondary)', margin: 0 }}>
                {opportunity.org_name}
              </p>
            </div>

            {/* Quick stats row */}
            <div style={{
              display: 'flex',
              gap: '12px',
              flexWrap: 'wrap',
              marginBottom: '32px',
            }}>
              {opportunity.deadline && (
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deadline</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: '600' }}>
                      {new Date(opportunity.deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <DeadlineBadge days={daysLeft} />
                  </div>
                </div>
              )}
              {opportunity.amount && (
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Value</p>
                  <p style={{ fontSize: '14px', color: 'var(--success)', margin: 0, fontWeight: '700' }}>
                    ${opportunity.amount.toLocaleString()}
                  </p>
                </div>
              )}
              {opportunity.province && (
                <div style={{
                  padding: '10px 16px',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-default)',
                }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0 0 2px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Location</p>
                  <p style={{ fontSize: '14px', color: 'var(--text-primary)', margin: 0, fontWeight: '600' }}>{opportunity.province}</p>
                </div>
              )}
            </div>

            {/* Description */}
            {opportunity.description && (
              <div style={{
                marginBottom: '32px',
                padding: '24px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
              }}>
                <h2 style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: 'var(--text-primary)',
                  margin: '0 0 12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-display)',
                }}>
                  About this opportunity
                </h2>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  lineHeight: '1.7',
                  margin: 0,
                  whiteSpace: 'pre-wrap',
                }}>
                  {opportunity.description}
                </p>
              </div>
            )}

            {/* Tags */}
            {opportunity.interest_tags && (
              <div style={{ marginBottom: '32px' }}>
                <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-muted)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tags</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {(Array.isArray(opportunity.interest_tags)
                    ? opportunity.interest_tags
                    : opportunity.interest_tags.split(',')
                  ).map((tag, i) => (
                    <span key={i} style={{
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: 'var(--accent-violet-muted)',
                      border: '1px solid var(--accent-violet-border)',
                      color: 'var(--accent-violet)',
                      fontFamily: 'var(--font-sans)',
                    }}>
                      {tag.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Resources */}
            {opportunity.resources && opportunity.resources.length > 0 && (
              <div style={{
                padding: '24px',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-default)',
                marginBottom: '32px',
              }}>
                <h3 style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 14px', fontFamily: 'var(--font-display)' }}>
                  📚 Resources to help you win
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {opportunity.resources.map((resource, idx) => (
                <a                    
                      key={idx}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 16px',
                        backgroundColor: 'var(--bg-elevated)',
                        border: '1px solid var(--border-default)',
                        borderRadius: 'var(--radius-md)',
                        textDecoration: 'none',
                        transition: 'border-color var(--transition)',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent-violet-border)'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                    >
                      <span style={{ fontSize: '16px' }}>🔗</span>
                      <p style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)', margin: 0, flex: 1 }}>
                        {resource.title}
                      </p>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Open →</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <UpcomingSessions opportunity={opportunity} />
            <RelatedCourses opportunity={opportunity} />
            <SimilarOpportunities currentId={id} type={opportunity.type} />
          </motion.div>

          {/* RIGHT: sticky action panel */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: 'sticky',
              top: '80px',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-default)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <p style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-display)' }}>
              Quick actions
            </p>

            {/* Visit official page */}
            <button
              onClick={() => window.open(opportunity.link || opportunity.url, '_blank')}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                backgroundColor: 'var(--accent-violet)',
                color: 'white',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                fontFamily: 'var(--font-sans)',
                transition: 'background-color var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--accent-violet-hover)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--accent-violet)'}
            >
              Visit official page →
            </button>

            {/* Save button */}
            {user && (
              <button
                onClick={toggleSave}
                disabled={saveLoading}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isSaved ? 'var(--accent-violet-border)' : 'var(--border-strong)',
                  backgroundColor: isSaved ? 'var(--accent-violet-muted)' : 'transparent',
                  color: isSaved ? 'var(--accent-violet)' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: saveLoading ? 'not-allowed' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all var(--transition)',
                  opacity: saveLoading ? 0.6 : 1,
                }}
              >
                {isSaved ? '🔖 Saved' : '🔖 Save'}
              </button>
            )}

            {/* Track application button */}
            {user && (
              <button
                onClick={handleTrackApplication}
                disabled={isApplied}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid',
                  borderColor: isApplied ? 'var(--success)' : 'var(--border-default)',
                  backgroundColor: isApplied ? 'var(--success-muted)' : 'transparent',
                  color: isApplied ? 'var(--success)' : 'var(--text-muted)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: isApplied ? 'default' : 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'all var(--transition)',
                }}
              >
                {isApplied ? '✓ Applied' : 'Mark as applied'}
              </button>
            )}

            {/* Essay requirement notice */}
            {opportunity.requires_essay && (
              <div style={{
                padding: '10px 14px',
                backgroundColor: 'var(--warning-muted)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(245,158,11,0.2)',
              }}>
                <p style={{ fontSize: '12px', color: 'var(--warning)', margin: 0, fontWeight: '600' }}>
                  ✍️ Essay required
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          padding: '12px 20px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: toast.type === 'success' ? 'var(--success)' : toast.type === 'error' ? 'var(--danger)' : 'var(--bg-elevated)',
          color: 'white',
          fontSize: '13px',
          fontWeight: '600',
          fontFamily: 'var(--font-sans)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
        }}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  )
}