import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Footer from '../components/Footer'

export default function OpportunityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { theme } = useTheme()
  const [opportunity, setOpportunity] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(false)
  const [isApplied, setIsApplied] = useState(false)

  useEffect(() => {
    fetchOpportunity()
  }, [id])

  async function fetchOpportunity() {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setOpportunity(data)
      setLoading(false)

      if (user) {
        checkSaved()
        checkApplied()
      }
    } catch (error) {
      console.error('Error fetching opportunity:', error)
      setLoading(false)
    }
  }

  async function checkSaved() {
    const { data } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', id)
    setIsSaved(data && data.length > 0)
  }

  async function checkApplied() {
    const { data } = await supabase
      .from('applications')
      .select('id')
      .eq('user_id', user.id)
      .eq('opportunity_id', id)
    setIsApplied(data && data.length > 0)
  }

  async function toggleSave() {
    if (isSaved) {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', id)
      setIsSaved(false)
    } else {
      await supabase
        .from('saves')
        .insert({ user_id: user.id, opportunity_id: id })
      setIsSaved(true)
    }
  }

  async function trackApplication() {
    if (!isApplied) {
      await supabase
        .from('applications')
        .insert({ user_id: user.id, opportunity_id: id })
      setIsApplied(true)
    }
  }

  if (loading) return <div style={{ padding: '120px 20px', textAlign: 'center', color: theme.text }}>Loading...</div>
  if (!opportunity) return <div style={{ padding: '120px 20px', textAlign: 'center', color: theme.text }}>Not found</div>

  const daysUntilDeadline = opportunity.deadline
    ? Math.ceil((new Date(opportunity.deadline) - new Date()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div style={{ backgroundColor: theme.bg, color: theme.text, minHeight: '100vh' }}>
      <div style={styles.container}>
        <button
          onClick={() => navigate(-1)}
          style={{
            ...styles.backBtn,
            color: theme.accent,
            marginTop: '80px',
            marginBottom: '24px',
          }}
        >
          ← Back
        </button>

        <div style={styles.header}>
          <div>
            <h1 style={{ ...styles.title, color: theme.text }}>
              {opportunity.title}
            </h1>
            <p style={{ ...styles.org, color: theme.secondary }}>
              {opportunity.org_name}
            </p>
          </div>
          <div style={styles.actions}>
            <button
              onClick={toggleSave}
              style={{
                ...styles.btn,
                backgroundColor: isSaved ? theme.accent : theme.hover,
                color: isSaved ? theme.bg : theme.text,
                borderColor: theme.accent,
              }}
            >
              {isSaved ? '★ Saved' : '☆ Save'}
            </button>
            <button
              onClick={() => {
                window.open(opportunity.url, '_blank')
                trackApplication()
              }}
              style={{
                ...styles.btn,
                backgroundColor: theme.accent,
                color: theme.bg,
              }}
            >
              Apply Now
            </button>
          </div>
        </div>

        <div style={styles.grid}>
          {/* Left Column */}
          <div>
            <section style={styles.section}>
              <h2 style={{ ...styles.sectionTitle, color: theme.text }}>Overview</h2>
              <p style={{ ...styles.text, color: theme.text }}>
                {opportunity.description}
              </p>
            </section>

            <section style={styles.section}>
              <h2 style={{ ...styles.sectionTitle, color: theme.text }}>Details</h2>
              <div style={styles.detailsGrid}>
                {opportunity.type && (
                  <div style={styles.detail}>
                    <span style={{ ...styles.label, color: theme.secondary }}>Type</span>
                    <span style={{ color: theme.text }}>{opportunity.type}</span>
                  </div>
                )}
                {opportunity.amount && (
                  <div style={styles.detail}>
                    <span style={{ ...styles.label, color: theme.secondary }}>Award</span>
                    <span style={{ color: theme.text, fontWeight: '600', fontSize: '16px' }}>
                      ${opportunity.amount.toLocaleString()}
                    </span>
                  </div>
                )}
                {daysUntilDeadline !== null && (
                  <div style={styles.detail}>
                    <span style={{ ...styles.label, color: theme.secondary }}>Deadline</span>
                    <span style={{ color: theme.text }}>
                      {new Date(opportunity.deadline).toLocaleDateString()}
                      {daysUntilDeadline > 0 && (
                        <span style={{ color: theme.accent, marginLeft: '8px', fontSize: '12px' }}>
                          ({daysUntilDeadline} days left)
                        </span>
                      )}
                    </span>
                  </div>
                )}
                {opportunity.eligibility_notes && (
                  <div style={styles.detail}>
                    <span style={{ ...styles.label, color: theme.secondary }}>Eligibility</span>
                    <span style={{ color: theme.text }}>{opportunity.eligibility_notes}</span>
                  </div>
                )}
              </div>
            </section>

            {opportunity.requires_essay && (
              <section style={styles.section}>
                <h2 style={{ ...styles.sectionTitle, color: theme.text }}>📝 Essay Required</h2>
                <p style={{ ...styles.text, color: theme.secondary }}>
                  This opportunity requires an essay submission.
                </p>
              </section>
            )}
          </div>

          {/* Right Column */}
          <div>
            <div style={{
              ...styles.sideCard,
              backgroundColor: theme.surface,
              border: `1.5px solid ${theme.border}`,
            }}>
              <div style={styles.cardHeader}>
                <h3 style={{ color: theme.text }}>Key Info</h3>
              </div>

              {opportunity.provider && (
                <div style={styles.cardItem}>
                  <span style={{ color: theme.secondary }}>Provider</span>
                  <span style={{ color: theme.text, fontWeight: '600' }}>
                    {opportunity.provider}
                  </span>
                </div>
              )}

              {opportunity.grade_scope && (
                <div style={styles.cardItem}>
                  <span style={{ color: theme.secondary }}>Grade Scope</span>
                    <span style={{ color: theme.text }}>
                    {opportunity.grade_scope
                        ? (Array.isArray(opportunity.grade_scope)
                            ? opportunity.grade_scope.map(g => `Grade ${g}`).join(', ')
                            : String(opportunity.grade_scope).replace(/(\d+)/g, 'Grade $1, ').replace(/,\s*$/, ''))
                        : 'All grades'}
                    </span>                </div>
              )}

              {opportunity.province_scope && (
                <div style={styles.cardItem}>
                  <span style={{ color: theme.secondary }}>Province</span>
                    <span style={{ color: theme.text }}>
                    {opportunity.province_scope
                        ? (Array.isArray(opportunity.province_scope)
                            ? opportunity.province_scope.join(', ')
                            : String(opportunity.province_scope)
                                .replace(/AB/g, 'AB, ')
                                .replace(/BC/g, 'BC, ')
                                .replace(/MB/g, 'MB, ')
                                .replace(/NB/g, 'NB, ')
                                .replace(/NL/g, 'NL, ')
                                .replace(/NS/g, 'NS, ')
                                .replace(/ON/g, 'ON, ')
                                .replace(/PE/g, 'PE, ')
                                .replace(/QC/g, 'QC, ')
                                .replace(/SK/g, 'SK, ')
                                .replace(/NT/g, 'NT, ')
                                .replace(/NU/g, 'NU, ')
                                .replace(/YT/g, 'YT, ')
                                .replace(/,\s*$/, ''))
                        : 'All provinces'}
                    </span>                </div>
              )}

              {opportunity.interest_tags && (
                <div style={styles.cardItem}>
                    <span style={{ color: theme.secondary }}>Interests</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {(Array.isArray(opportunity.interest_tags) 
                        ? opportunity.interest_tags 
                        : opportunity.interest_tags.split(',')).map((tag, i) => (
                      <span
                        key={i}
                        style={{
                          ...styles.tag,
                          backgroundColor: theme.accent,
                          color: theme.bg,
                        }}
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => window.open(opportunity.url, '_blank')}
                style={{
                  ...styles.ctaBtn,
                  backgroundColor: theme.accent,
                  color: theme.bg,
                  marginTop: '16px',
                  width: '100%',
                }}
              >
                Visit Official Page →
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 24px 80px',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  org: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0',
  },
  actions: {
    display: 'flex',
    gap: '12px',
  },
  btn: {
    padding: '12px 24px',
    borderRadius: '10px',
    border: '1.5px solid',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 320px',
    gap: '32px',
  },
  section: {
    marginBottom: '40px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '700',
    margin: '0 0 16px 0',
  },
  text: {
    fontSize: '15px',
    lineHeight: '1.6',
    margin: '0',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px',
  },
  detail: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
sideCard: {
    borderRadius: '12px',
    padding: '20px',
    position: 'sticky',
    top: '80px',
  },
  cardHeader: {
    marginBottom: '16px',
    paddingBottom: '16px',
    borderBottom: '1px solid',
  },
  cardItem: {
    paddingBottom: '16px',
    marginBottom: '16px',
    borderBottom: '1px solid',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  tag: {
    padding: '5px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '600',
  },
  ctaBtn: {
    padding: '12px 20px',
    borderRadius: '10px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  },
}