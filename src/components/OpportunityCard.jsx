  import { useState } from 'react'
  import OpportunityModal from './OpportunityModal'

  export default function OpportunityCard({ opportunity, isSaved, isApplied, deadlineUrgency, onToggleSave, onLogView, onTrackApplication }) {
    const [showModal, setShowModal] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const { type, title, org_name, description, deadline, amount } = opportunity

    // Helper to open modal and log the view for analytics
    const handleViewDetails = () => {
      onLogView(opportunity.id)
      setShowModal(true)
    }
    return (
      <>
        <div 
          style={{
            ...styles.card,
            borderColor: deadlineUrgency === 'urgent' ? '#ef4444' : deadlineUrgency === 'soon' ? '#f59e0b' : '#e5e7eb',
            borderWidth: deadlineUrgency === 'urgent' ? '2px' : '1px',
            transform: isHovering ? 'translateY(-8px)' : 'translateY(0)',
            boxShadow: isHovering ? '0 12px 24px rgba(0,0,0,0.1)' : '0 1px 4px rgba(0,0,0,0.05)',
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={handleViewDetails}
        >
          {(deadlineUrgency === 'urgent' || deadlineUrgency === 'soon') && (
          <div style={{
            ...styles.urgencyBanner,
            backgroundColor: deadlineUrgency === 'urgent' ? '#fef2f2' : '#fffbeb',
            color: deadlineUrgency === 'urgent' ? '#dc2626' : '#b45309',
            borderBottom: deadlineUrgency === 'urgent' ? '1px solid #fecaca' : '1px solid #fde68a',
          }}>
            {deadlineUrgency === 'urgent' ? '🔴 Closing very soon' : '🟡 Deadline this week'}
          </div>
        )}
        <div style={styles.cardTop}>
            <span style={{
              ...styles.badge,
              backgroundColor: badgeColor(type),
              color: badgeTextColor(type),
            }}>
              {type}
            </span>
            <button
              style={{
                ...styles.saveBtn,
                transform: isHovering ? 'scale(1.1)' : 'scale(1)',
              }}
              onClick={(e) => {
                e.stopPropagation()
                onToggleSave(opportunity.id)
              }}
            >
              {isSaved ? '★' : '☆'}
            </button>
          </div>

          <h3 style={styles.cardTitle}>{title}</h3>
          <p style={styles.orgName}>{org_name}</p>
          <p style={styles.description}>{description}</p>

          <div style={styles.cardFooter}>
            {deadline && (
              <span style={{
                ...styles.deadline,
                color: deadlineUrgency === 'urgent' ? '#dc2626' : deadlineUrgency === 'soon' ? '#b45309' : '#6b7280',
                fontWeight: deadlineUrgency === 'urgent' || deadlineUrgency === 'soon' ? '700' : '500',
              }}>
                📅 {new Date(deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
              </span>
            )}
            {amount > 0 && (
              <span style={styles.amount}>
                💰 {amount === 1 ? "Value Varies" : `$${amount.toLocaleString()}`}
              </span>
            )}
          </div>

          {isHovering && (
          <div style={styles.ctaContainer}>
          <button style={styles.ctaBtn} onClick={(e) => { e.stopPropagation(); handleViewDetails() }}>
            View details →
          </button>
              {!isApplied ? (
              <button
                  style={styles.applyBtn}
                  onClick={(e) => {
                  e.stopPropagation()
                  onTrackApplication(opportunity.id)
                  }}
              >
                  Mark applied
              </button>
              ) : (
              <span style={styles.appliedBadge}>✓ Applied</span>
              )}
          </div>
          )}
        </div>

        {showModal && (
          <OpportunityModal
            opportunity={opportunity}
            isSaved={isSaved}
            onToggleSave={onToggleSave}
            onLogView={onLogView} // Corrected: Use the prop name
            onClose={() => setShowModal(false)}
          />
        )}
      </>
    )
  }

  function badgeColor(type) {
    const colors = {
      scholarship: '#10b981',
      competition: '#3b82f6',
      internship: '#f59e0b',
      program: '#8b5cf6',
      grant: '#ef4444',
    }
    return colors[type] || '#6b7280'
  }

  function badgeTextColor(type) {
    return '#fff'
  }

  const styles = {
    card: {
      backgroundColor: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '16px',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      cursor: 'pointer',
      transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
      position: 'relative',
      overflow: 'hidden',
    },
    cardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px',
    },
    badge: {
      display: 'inline-block',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '11px',
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    saveBtn: {
      background: 'none',
      border: 'none',
      fontSize: '24px',
      cursor: 'pointer',
      color: '#f59e0b',
      padding: '0',
      transition: 'all 0.2s',
    },
    urgencyBanner: {
    margin: '-24px -24px 0 -24px',
    padding: '7px 16px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.2px',
  },
    cardTitle: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#1a1a1a',
      margin: '0 0 4px 0',
      lineHeight: '1.4',
    },
    orgName: {
      fontSize: '13px',
      color: '#6b7280',
      fontWeight: '500',
      margin: '0',
    },
    description: {
      fontSize: '14px',
      color: '#4b5563',
      lineHeight: '1.6',
      flex: 1,
      margin: '8px 0',
    },
    cardFooter: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
      marginTop: '12px',
      paddingTop: '12px',
      borderTop: '1px solid #f3f4f6',
    },
    deadline: {
      fontSize: '13px',
      color: '#6b7280',
      fontWeight: '500',
    },
    amount: {
      fontSize: '13px',
      fontWeight: '700',
      color: '#10b981',
    },
    ctaBtn: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      right: '0',
      padding: '12px 24px',
      backgroundColor: '#2563eb',
      color: '#fff',
      border: 'none',
      fontSize: '13px',
      fontWeight: '600',
      cursor: 'pointer',
      animation: 'slideUp 0.3s ease-out',
    },
  ctaContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: '8px',
    marginTop: '4px',
    paddingTop: '12px',
    borderTop: '1px solid #f3f4f6',
  },
  ctaBtn: {
    flex: 1,
    padding: '8px 12px',
    backgroundColor: '#064e3b',
    color: '#fff',
    border: 'none',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  applyBtn: {
    padding: '8px 12px',
    backgroundColor: '#f0fdf4',
    color: '#064e3b',
    border: '1px solid #6ee7b7',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    borderRadius: '8px',
  },
  appliedBadge: {
    padding: '8px 12px',
    backgroundColor: '#f0fdf4',
    color: '#064e3b',
    fontSize: '13px',
    fontWeight: '600',
    borderRadius: '8px',
    border: '1px solid #6ee7b7',
  },

  }