import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'

export default function Admin() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    org_name: '',
    description: '',
    type: 'scholarship',
    deadline: '',
    amount: '',
    url: '',
    province_scope: ['ALL'],
    grade_scope: [9, 10, 11, 12],
    interest_tags: [],
    is_active: true,
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const opportunityTypes = ['scholarship', 'competition', 'internship', 'program', 'grant']
  const provinces = ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
  const grades = [9, 10, 11, 12]
  const interestOptions = [
    'STEM', 'Business', 'Arts', 'Environmental', 'Social Justice',
    'Leadership', 'Technology', 'Health', 'Engineering', 'Finance'
  ]

  function handleInputChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  function handleArrayChange(field, value, checked) {
    setFormData(prev => {
      const current = prev[field]
      if (checked) {
        return { ...prev, [field]: [...current, value] }
      } else {
        return { ...prev, [field]: current.filter(item => item !== value) }
      }
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase
      .from('opportunities')
      .insert([{
        title: formData.title,
        org_name: formData.org_name,
        description: formData.description,
        type: formData.type,
        deadline: formData.deadline || null,
        amount: formData.amount ? parseInt(formData.amount) : null,
        url: formData.url,
        province_scope: formData.province_scope,
        grade_scope: formData.grade_scope,
        interest_tags: formData.interest_tags,
        is_active: formData.is_active,
      }])

    if (error) {
      setMessage(`Error: ${error.message}`)
    } else {
      setMessage('Opportunity added successfully!')
      setFormData({
        title: '',
        org_name: '',
        description: '',
        type: 'scholarship',
        deadline: '',
        amount: '',
        url: '',
        province_scope: ['ALL'],
        grade_scope: [9, 10, 11, 12],
        interest_tags: [],
        is_active: true,
      })
    }

    setLoading(false)
  }

  // Basic auth check - only you can access this
  if (user?.email !== 'm.shahmeer.khan8@gmail.com') {
    return (
      <div style={styles.container}>
        <div style={styles.unauthorized}>
          <h2>Unauthorized</h2>
          <p>You don't have access to this page.</p>
          <button style={styles.homeBtn} onClick={() => navigate('/dashboard')}>
            Back to dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.heading}>Add Opportunity</h1>
        <button style={styles.signOutBtn} onClick={signOut}>Sign out</button>
      </div>

      {message && (
        <div style={{
          ...styles.messageBox,
          backgroundColor: message.includes('Error') ? '#fee2e2' : '#dcfce7',
          color: message.includes('Error') ? '#dc2626' : '#166534',
          borderColor: message.includes('Error') ? '#fecaca' : '#bbf7d0',
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Basic Info</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Loran Scholarship"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Organization</label>
            <input
              type="text"
              name="org_name"
              value={formData.org_name}
              onChange={handleInputChange}
              placeholder="e.g., Loran Scholars Foundation"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the opportunity..."
              style={{...styles.input, minHeight: '100px'}}
              required
            />
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Type</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                style={styles.input}
              >
                {opportunityTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Amount (CAD)</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleInputChange}
                placeholder="e.g., 100000"
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.row}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Deadline</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleInputChange}
                style={styles.input}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>URL</label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                placeholder="https://..."
                style={styles.input}
                required
              />
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Scope</h3>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Provinces</label>
            <div style={styles.checkboxGroup}>
              {provinces.map(province => (
                <label key={province} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.province_scope.includes(province)}
                    onChange={(e) => handleArrayChange('province_scope', province, e.target.checked)}
                  />
                  {province}
                </label>
              ))}
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.province_scope.includes('ALL')}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setFormData(prev => ({ ...prev, province_scope: ['ALL'] }))
                    } else {
                      setFormData(prev => ({ ...prev, province_scope: [] }))
                    }
                  }}
                />
                All Canada
              </label>
            </div>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Grades</label>
            <div style={styles.checkboxGroup}>
              {grades.map(grade => (
                <label key={grade} style={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.grade_scope.includes(grade)}
                    onChange={(e) => handleArrayChange('grade_scope', grade, e.target.checked)}
                  />
                  Grade {grade}
                </label>
              ))}
            </div>
          </div>
        </div>

        <div style={styles.formSection}>
          <h3 style={styles.sectionTitle}>Interests</h3>
          <div style={styles.checkboxGroup}>
            {interestOptions.map(interest => (
              <label key={interest} style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.interest_tags.includes(interest)}
                  onChange={(e) => handleArrayChange('interest_tags', interest, e.target.checked)}
                />
                {interest}
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.6 : 1,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add opportunity'}
        </button>
      </form>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
  },
  heading: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1a1a1a',
  },
  signOutBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #e0e0e0',
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontSize: '14px',
    color: '#333',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#333',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '14px',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  checkboxGroup: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '12px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#555',
    cursor: 'pointer',
  },
  submitBtn: {
    padding: '12px 16px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    marginTop: '16px',
  },
  messageBox: {
    padding: '12px 14px',
    borderRadius: '8px',
    border: '1px solid',
    marginBottom: '24px',
    fontSize: '14px',
  },
  unauthorized: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#666',
  },
  homeBtn: {
    marginTop: '20px',
    padding: '10px 20px',
    borderRadius: '8px',
    backgroundColor: '#2563eb',
    color: '#fff',
    fontSize: '14px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
  },
}