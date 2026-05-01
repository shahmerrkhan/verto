import { useState, useEffect } from 'react'
import ShareButton from './ShareButton'
import { supabase } from '../lib/supabase'


export default function OpportunityModal({ opportunity, isSaved, onToggleSave, onLogView, onClose }) {
  const { id, type, title, org_name, description, deadline, amount, url, interest_tags } = opportunity
  const [isClosing, setIsClosing] = useState(false)
  useEffect(() => {
  document.body.style.overflow = 'hidden'
  return () => { document.body.style.overflow = '' }
}, [])

  function handleClose() {
    setIsClosing(true)
    setTimeout(onClose, 200)
  }

  async function handleApply() {
    // 1. Tell the parent to log a 'view'
    if (onLogView) onLogView(id);

    // 2. Insert a record into the 'applications' table
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase
          .from('applications')
          .insert([{ 
            opportunity_id: id, 
            user_id: user.id 
          }]);
        
        if (error) console.error("Error saving application:", error.message);
      }
    } catch (err) {
      console.error("Critical error during apply:", err);
    }

    // 3. Open the application link
    window.open(url, '_blank');
  }

  return (
    <div
      style={{
        ...styles.overlay,
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          ...styles.modal,
          transform: isClosing ? 'scale(0.95) translateY(20px)' : 'scale(1) translateY(0)',
          opacity: isClosing ? 0 : 1,
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div>
            <span style={{
              ...styles.badge,
              backgroundColor: badgeColor(type)
            }}>
              {type}
            </span>
            <h2 style={styles.title}>{title}</h2>
            <p style={styles.org}>{org_name}</p>
          </div>
          <button style={styles.closeBtn} onClick={handleClose}>✕</button>
        </div>

        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>About</h3>
            <p style={styles.description}>{description}</p>
          </div>

          {interest_tags && interest_tags.length > 0 && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Interests</h3>
              <div style={styles.tags}>
                {interest_tags.map(tag => (
                  <span key={tag} style={styles.tag}>{tag}</span>
                ))}
              </div>
            </div>
          )}

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Details</h3>
            <div style={styles.details}>
              {deadline && (
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Deadline</span>
                  <span style={styles.detailValue}>
                    {new Date(deadline).toLocaleDateString('en-CA', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  </span>
                </div>
              )}
              {amount > 0 ? (
                <span style={styles.detailValue}>${amount.toLocaleString()}</span>
              ) : (
                <span style={styles.detailValue}>Value Varies / Free</span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.footer}>
      <button
        style={{
          ...styles.saveBtn,
          backgroundColor: isSaved ? '#fbbf24' : '#f3f4f6',
          color: isSaved ? '#fff' : '#666',
        }}
        onClick={() => onToggleSave(id)}
      >
        {isSaved ? '★ Saved' : '☆ Save'}
      </button>
      <ShareButton opportunity={opportunity} />
      <button style={styles.applyBtn} onClick={handleApply}>
        Apply →
      </button>
    </div>
      </div>
    </div>
  )
}

function badgeColor(type) {
  const colors = {
    scholarship: '#dcfce7',
    competition: '#dbeafe',
    internship: '#fef9c3',
    program: '#f3e8ff',
    grant: '#ffe4e6',
  }
  return colors[type] || '#f3f4f6'
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modal: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px rgba(0, 0, 0, 0.15)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '32px 24px 24px',
    borderBottom: '1px solid #e8e8e8',
  },
  badge: {
    display: 'inline-block',
    padding: '4px 10px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: '4px',
  },
  org: {
    fontSize: '14px',
    color: '#888',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#999',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    padding: '24px',
  },
  section: {
    marginBottom: '24px',
  },
  sectionTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '12px',
  },
  description: {
    fontSize: '15px',
    color: '#555',
    lineHeight: '1.6',
  },
  tags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tag: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#555',
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: '12px',
    borderBottom: '1px solid #f0f0f0',
  },
  detailLabel: {
    fontSize: '13px',
    color: '#888',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  footer: {
    display: 'flex',
    gap: '8px',
    padding: '24px',
    borderTop: '1px solid #e8e8e8',
    flexWrap: 'wrap',
  },
 saveBtn: {
    flex: 1,
    minWidth: '100px',
    padding: '12px 16px',
    borderRadius: '8px',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  applyBtn: {
    flex: 1,
    minWidth: '100px',
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    border: 'none',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
}