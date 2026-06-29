import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const TYPES = ['scholarship', 'competition', 'internship', 'program', 'grant']
const PROVINCES = ['ALL', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
const GRADES = [9, 10, 11, 12]
const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research', 'Business & Entrepreneurship',
  'Arts & Design', 'Law & Politics', 'Medicine & Health', 'Environment & Sustainability',
  'Education', 'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]
const SKILLS = [
  'Essay Writing', 'Interview Prep', 'Research Methods', 'Coding & Algorithms',
  'Math Olympiad Prep', 'Science Fair Projects', 'Business Planning', 'Public Speaking',
  'Scholarship Applications', 'University Admissions', 'Debate', 'Film & Media',
  'Environmental Science', 'Biotech & Lab Research', 'Financial Literacy', 'Leadership'
]

const EMPTY_FORM = {
  title: '', org_name: '', description: '', type: 'scholarship',
  deadline: '', amount: '', url: '', requires_essay: false,
  province_scope: ['ALL'], grade_scope: [9, 10, 11, 12],
  interest_tags: [], is_active: true,
}

const EMPTY_SESSION = {
  mentor_id: '',
  title: '',
  description: '',
  skill_focus: '',
  opportunity_types: [],
  interest_tags: [],
  session_date: '',
  duration_minutes: 60,
  meeting_link: '',
  max_attendees: 50,
}

export default function Admin() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('add')
  const [form, setForm] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [opportunities, setOpportunities] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [searchList, setSearchList] = useState('')
  const [editingId, setEditingId] = useState(null)

  // Mentors
  const [mentors, setMentors] = useState([])
  const [loadingMentors, setLoadingMentors] = useState(false)
  const [mentorFilter, setMentorFilter] = useState('pending')

  // Sessions
  const [sessionForm, setSessionForm] = useState(EMPTY_SESSION)
  const [sessionLoading, setSessionLoading] = useState(false)
  const [sessionMessage, setSessionMessage] = useState(null)
  const [approvedMentors, setApprovedMentors] = useState([])

  // Emails
  const [applicants, setApplicants] = useState([])
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [emailCopied, setEmailCopied] = useState(false)

  useEffect(() => {
    if (tab === 'manage') fetchAll()
    if (tab === 'mentors') fetchMentors()
    if (tab === 'sessions') fetchApprovedMentors()
    if (tab === 'emails') fetchApplicants()
  }, [tab])

  async function fetchAll() {
    setLoadingList(true)
    const res = await fetch('/api/opportunities')
    const data = await res.json()
    setOpportunities(Array.isArray(data) ? data : [])
    setLoadingList(false)
  }

  async function fetchMentors() {
    setLoadingMentors(true)
    const res = await fetch('/api/mentors')
    const data = await res.json()
    setMentors(Array.isArray(data) ? data : [])
    setLoadingMentors(false)
  }

  async function fetchApprovedMentors() {
    const res = await fetch('/api/mentors?status=approved')
    const data = await res.json()
    setApprovedMentors(Array.isArray(data) ? data : [])
  }

  async function fetchApplicants() {
    setLoadingApplicants(true)
    const res = await fetch('/api/applicants')
    const data = await res.json()
    setApplicants(Array.isArray(data) ? data : [])
    setLoadingApplicants(false)
  }

  async function updateMentorStatus(id, status) {
    await fetch('/api/mentors/update-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    setMentors(prev => prev.map(m => m.id === id ? { ...m, status } : m))
  }

  async function handleSessionSubmit() {
    if (!sessionForm.mentor_id || !sessionForm.title || !sessionForm.session_date || !sessionForm.meeting_link) {
      setSessionMessage({ type: 'error', text: 'Mentor, title, date, and meeting link are required.' })
      return
    }
    setSessionLoading(true)
    setSessionMessage(null)
    const res = await fetch('/api/sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionForm,
        duration_minutes: parseInt(sessionForm.duration_minutes),
        max_attendees: parseInt(sessionForm.max_attendees),
      }),
    })
    setSessionLoading(false)
    if (res.ok) {
      setSessionMessage({ type: 'success', text: 'Session created successfully!' })
      setSessionForm(EMPTY_SESSION)
    } else {
      const err = await res.json()
      setSessionMessage({ type: 'error', text: err.error || 'Something went wrong.' })
    }
  }

  function toggleSessionArray(field, value) {
    setSessionForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  function copyEmails() {
    const emails = [...new Set(applicants.map(a => a.user_id))].join(', ')
    navigator.clipboard.writeText(emails)
    setEmailCopied(true)
    setTimeout(() => setEmailCopied(false), 2000)
  }

  function exportCSV() {
    const rows = [['User ID', 'Opportunity', 'Type', 'Applied At']]
    applicants.forEach(a => {
      rows.push([
        a.user_id,
        a.opportunities?.title || '',
        a.opportunities?.type || '',
        new Date(a.applied_at).toLocaleDateString(),
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'verto-applicants.csv'
    link.click()
  }

  function toggleArray(field, value) {
    setForm(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  async function handleSubmit() {
    if (!form.title || !form.org_name || !form.url) {
      setMessage({ type: 'error', text: 'Title, organization, and URL are required.' })
      return
    }
    setLoading(true)
    setMessage(null)
    const payload = {
      ...form,
      amount: form.amount ? parseInt(form.amount) : null,
      deadline: form.deadline || null,
    }
    const res = await fetch(editingId ? `/api/opportunities/${editingId}` : '/api/opportunities/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    setLoading(false)
    if (res.ok) {
      setMessage({ type: 'success', text: editingId ? 'Opportunity updated!' : 'Opportunity added!' })
      setForm(EMPTY_FORM)
      setEditingId(null)
      if (tab === 'manage') fetchAll()
    } else {
      const err = await res.json()
      setMessage({ type: 'error', text: err.error || 'Something went wrong.' })
    }
  }

  async function toggleActive(id, current) {
    await fetch(`/api/opportunities/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !current }),
    })
    setOpportunities(opportunities.map(op => op.id === id ? { ...op, is_active: !current } : op))
  }

  async function deleteOpp(id) {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return
    await fetch(`/api/opportunities/${id}`, { method: 'DELETE' })
    setOpportunities(opportunities.filter(op => op.id !== id))
  }

  function startEdit(op) {
    setForm({
      title: op.title || '', org_name: op.org_name || '', description: op.description || '',
      type: op.type || 'scholarship', deadline: op.deadline || '', amount: op.amount || '',
      url: op.url || '', requires_essay: op.requires_essay || false,
      province_scope: op.province_scope || ['ALL'], grade_scope: op.grade_scope || [9,10,11,12],
      interest_tags: op.interest_tags || [], is_active: op.is_active ?? true,
    })
    setEditingId(op.id)
    setTab('add')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (user?.email !== 'm.shahmeer.khan8@gmail.com') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <p style={{ fontSize: '18px', fontWeight: '700', color: '#111' }}>Access denied</p>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', borderRadius: '10px', backgroundColor: '#064e3b', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Back to dashboard</button>
      </div>
    )
  }

  const filtered = opportunities.filter(op =>
    op.title?.toLowerCase().includes(searchList.toLowerCase()) ||
    op.org_name?.toLowerCase().includes(searchList.toLowerCase())
  )

  const filteredMentors = mentors.filter(m => m.status === mentorFilter)

  return (
    <div style={A.page}>
      <div style={A.pageTitle}>
        <h1 style={A.title}>Admin panel</h1>
        <p style={A.subtitle}>Manage everything across the platform</p>
      </div>

      {/* Stats row */}
      <div style={{ ...A.statsRow, gridTemplateColumns: 'repeat(5, 1fr)' }}>
        {[
          { label: 'Total opportunities', value: opportunities.length },
          { label: 'Active', value: opportunities.filter(o => o.is_active).length },
          { label: 'Inactive', value: opportunities.filter(o => !o.is_active).length },
          { label: 'Mentor applications', value: mentors.filter(m => m.status === 'pending').length },
          { label: 'Total applicants', value: applicants.length },
        ].map(s => (
          <div key={s.label} style={A.statCard}>
            <p style={A.statValue}>{s.value}</p>
            <p style={A.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={A.tabs}>
        {[
          { key: 'add', label: editingId ? '✏️ Edit' : '+ Add' },
          { key: 'manage', label: `📋 Manage (${opportunities.length})` },
          { key: 'mentors', label: `👤 Mentors (${mentors.filter(m => m.status === 'pending').length} pending)` },
          { key: 'sessions', label: '🗓️ Sessions' },
          { key: 'emails', label: `📧 Emails (${applicants.length})` },
        ].map(t => (
          <button key={t.key} style={{ ...A.tab, ...(tab === t.key ? A.tabActive : {}) }} onClick={() => setTab(t.key)}>
            {t.label}
          </button>
        ))}
      </div>

      {message && (
        <div style={{ ...A.message, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', borderColor: message.type === 'error' ? '#fecaca' : '#bbf7d0', color: message.type === 'error' ? '#dc2626' : '#166534' }}>
          {message.text}
        </div>
      )}

      {/* ADD TAB */}
      {tab === 'add' && (
        <div style={A.formCard}>
          {editingId && (
            <div style={{ padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '10px', marginBottom: '24px', fontSize: '13px', color: '#1d4ed8', fontWeight: '600', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              Editing existing opportunity
              <button onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }} style={{ background: 'none', border: 'none', color: '#1d4ed8', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Cancel edit</button>
            </div>
          )}
          <div style={A.formGrid}>
            <div style={A.fieldFull}>
              <label style={A.label}>Title *</label>
              <input style={A.input} value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g., Loran Scholarship" />
            </div>
            <div style={A.fieldFull}>
              <label style={A.label}>Organization *</label>
              <input style={A.input} value={form.org_name} onChange={e => setForm({ ...form, org_name: e.target.value })} placeholder="e.g., Loran Scholars Foundation" />
            </div>
            <div style={A.fieldFull}>
              <label style={A.label}>Description</label>
              <textarea style={{ ...A.input, minHeight: '100px', resize: 'vertical' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Describe the opportunity..." />
            </div>
            <div>
              <label style={A.label}>Type</label>
              <div style={A.pillRow}>
                {TYPES.map(t => (
                  <button key={t} style={{ ...A.pill, ...(form.type === t ? A.pillActive : {}) }} onClick={() => setForm({ ...form, type: t })}>{t}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={A.label}>Deadline</label>
              <input type="date" style={A.input} value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} />
            </div>
            <div>
              <label style={A.label}>Amount (CAD)</label>
              <input type="number" style={A.input} value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="e.g., 10000" />
            </div>
            <div style={A.fieldFull}>
              <label style={A.label}>URL *</label>
              <input type="url" style={A.input} value={form.url} onChange={e => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
          <div style={A.section}>
            <p style={A.sectionLabel}>Province scope</p>
            <div style={A.pillRow}>
              {PROVINCES.map(p => (
                <button key={p} style={{ ...A.pill, ...(form.province_scope.includes(p) ? A.pillActive : {}) }} onClick={() => {
                  if (p === 'ALL') { setForm({ ...form, province_scope: ['ALL'] }); return }
                  const without = form.province_scope.filter(x => x !== 'ALL')
                  setForm({ ...form, province_scope: without.includes(p) ? without.filter(x => x !== p) : [...without, p] })
                }}>{p}</button>
              ))}
            </div>
          </div>
          <div style={A.section}>
            <p style={A.sectionLabel}>Grade scope</p>
            <div style={A.pillRow}>
              {GRADES.map(g => (
                <button key={g} style={{ ...A.pill, ...(form.grade_scope.includes(g) ? A.pillActive : {}) }} onClick={() => toggleArray('grade_scope', g)}>Grade {g}</button>
              ))}
            </div>
          </div>
          <div style={A.section}>
            <p style={A.sectionLabel}>Interest tags</p>
            <div style={A.pillRow}>
              {INTERESTS.map(i => (
                <button key={i} style={{ ...A.pill, ...(form.interest_tags.includes(i) ? A.pillActive : {}) }} onClick={() => toggleArray('interest_tags', i)}>{i}</button>
              ))}
            </div>
          </div>
          <div style={A.section}>
            <p style={A.sectionLabel}>Options</p>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              {[
                { key: 'requires_essay', label: 'Requires essay' },
                { key: 'is_active', label: 'Active (visible to students)' },
              ].map(opt => (
                <label key={opt.key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                  <div onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })} style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1.5px solid', borderColor: form[opt.key] ? '#064e3b' : '#d1d5db', backgroundColor: form[opt.key] ? '#064e3b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {form[opt.key] && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                  </div>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            {editingId && <button style={A.btnGhost} onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }}>Cancel</button>}
            <button style={{ ...A.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update opportunity' : 'Add opportunity'}
            </button>
          </div>
        </div>
      )}

      {/* MANAGE TAB */}
      {tab === 'manage' && (
        <div>
          <input type="text" placeholder="Search by title or organization..." value={searchList} onChange={e => setSearchList(e.target.value)} style={{ ...A.input, marginBottom: '20px', maxWidth: '400px' }} />
          {loadingList ? <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filtered.map(op => (
                <div key={op.id} style={A.listCard}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span style={{ ...A.typeBadge, backgroundColor: typeColor(op.type) }}>{op.type}</span>
                      <span style={{ ...A.statusDot, backgroundColor: op.is_active ? '#10b981' : '#d1d5db' }} />
                      <span style={{ fontSize: '11px', color: op.is_active ? '#10b981' : '#9ca3af', fontWeight: '600' }}>{op.is_active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{op.title}</p>
                    <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>{op.org_name} {op.deadline ? `· Due ${new Date(op.deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}` : ''} {op.amount ? `· $${op.amount.toLocaleString()}` : ''}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <button style={A.actionBtn} onClick={() => startEdit(op)}>Edit</button>
                    <button style={{ ...A.actionBtn, color: op.is_active ? '#6b7280' : '#064e3b' }} onClick={() => toggleActive(op.id, op.is_active)}>{op.is_active ? 'Deactivate' : 'Activate'}</button>
                    <button style={{ ...A.actionBtn, color: '#dc2626' }} onClick={() => deleteOpp(op.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: '#9ca3af', fontSize: '14px' }}>No results found.</p>}
            </div>
          )}
        </div>
      )}

      {/* MENTORS TAB */}
      {tab === 'mentors' && (
        <div>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {['pending', 'approved', 'rejected'].map(s => (
              <button key={s} style={{ ...A.pill, ...(mentorFilter === s ? A.pillActive : {}), textTransform: 'capitalize' }} onClick={() => setMentorFilter(s)}>
                {s} ({mentors.filter(m => m.status === s).length})
              </button>
            ))}
          </div>

          {loadingMentors ? <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {filteredMentors.length === 0 && <p style={{ color: '#9ca3af', fontSize: '14px' }}>No {mentorFilter} applications.</p>}
              {filteredMentors.map(mentor => (
                <div key={mentor.id} style={{ ...A.listCard, flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <p style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 2px' }}>{mentor.full_name}</p>
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '0 0 4px' }}>{mentor.role}{mentor.institution ? ` · ${mentor.institution}` : ''}</p>
                      <p style={{ fontSize: '12px', color: '#9ca3af', margin: 0 }}>{mentor.email}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {mentor.linkedin_url && (
                        <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" style={{ ...A.actionBtn, textDecoration: 'none', color: '#374151' }}>LinkedIn</a>
                      )}
                      {mentor.status !== 'approved' && (
                        <button style={{ ...A.actionBtn, color: '#059669', borderColor: '#059669' }} onClick={() => updateMentorStatus(mentor.id, 'approved')}>Approve</button>
                      )}
                      {mentor.status !== 'rejected' && (
                        <button style={{ ...A.actionBtn, color: '#dc2626', borderColor: '#dc2626' }} onClick={() => updateMentorStatus(mentor.id, 'rejected')}>Reject</button>
                      )}
                      {mentor.status !== 'pending' && (
                        <button style={A.actionBtn} onClick={() => updateMentorStatus(mentor.id, 'pending')}>Reset</button>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: 1.6 }}>{mentor.bio}</p>
                  {mentor.skills?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {mentor.skills.map(s => (
                        <span key={s} style={{ padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '600', backgroundColor: '#f0fdf4', color: '#059669', border: '1px solid #bbf7d0' }}>{s}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SESSIONS TAB */}
      {tab === 'sessions' && (
        <div style={A.formCard}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#111', margin: '0 0 20px' }}>Create a session</h2>

          {sessionMessage && (
            <div style={{ ...A.message, backgroundColor: sessionMessage.type === 'error' ? '#fef2f2' : '#f0fdf4', borderColor: sessionMessage.type === 'error' ? '#fecaca' : '#bbf7d0', color: sessionMessage.type === 'error' ? '#dc2626' : '#166534', marginBottom: '20px' }}>
              {sessionMessage.text}
            </div>
          )}

          <div style={A.formGrid}>
            <div style={A.fieldFull}>
              <label style={A.label}>Mentor *</label>
              <select style={A.input} value={sessionForm.mentor_id} onChange={e => setSessionForm({ ...sessionForm, mentor_id: e.target.value })}>
                <option value="">Select an approved mentor</option>
                {approvedMentors.map(m => (
                  <option key={m.id} value={m.id}>{m.full_name} — {m.role}</option>
                ))}
              </select>
              {approvedMentors.length === 0 && <p style={{ fontSize: '12px', color: '#9ca3af', margin: '6px 0 0' }}>No approved mentors yet. Approve mentors in the Mentors tab first.</p>}
            </div>

            <div style={A.fieldFull}>
              <label style={A.label}>Session title *</label>
              <input style={A.input} placeholder="e.g., How to write a winning Loran essay" value={sessionForm.title} onChange={e => setSessionForm({ ...sessionForm, title: e.target.value })} />
            </div>

            <div style={A.fieldFull}>
              <label style={A.label}>Description</label>
              <textarea style={{ ...A.input, minHeight: '80px', resize: 'vertical' }} placeholder="What will students learn? What should they prepare?" value={sessionForm.description} onChange={e => setSessionForm({ ...sessionForm, description: e.target.value })} />
            </div>

            <div>
              <label style={A.label}>Skill focus *</label>
              <input style={A.input} placeholder="e.g., Essay Writing" value={sessionForm.skill_focus} onChange={e => setSessionForm({ ...sessionForm, skill_focus: e.target.value })} />
            </div>

            <div>
              <label style={A.label}>Date & time *</label>
              <input type="datetime-local" style={A.input} value={sessionForm.session_date} onChange={e => setSessionForm({ ...sessionForm, session_date: e.target.value })} />
            </div>

            <div>
              <label style={A.label}>Duration (minutes)</label>
              <input type="number" style={A.input} value={sessionForm.duration_minutes} onChange={e => setSessionForm({ ...sessionForm, duration_minutes: e.target.value })} />
            </div>

            <div>
              <label style={A.label}>Max attendees</label>
              <input type="number" style={A.input} value={sessionForm.max_attendees} onChange={e => setSessionForm({ ...sessionForm, max_attendees: e.target.value })} />
            </div>

            <div style={A.fieldFull}>
              <label style={A.label}>Meeting link *</label>
              <input style={A.input} placeholder="https://meet.google.com/... or zoom link" value={sessionForm.meeting_link} onChange={e => setSessionForm({ ...sessionForm, meeting_link: e.target.value })} />
            </div>
          </div>

          <div style={A.section}>
            <p style={A.sectionLabel}>Relevant opportunity types</p>
            <div style={A.pillRow}>
              {TYPES.map(t => (
                <button key={t} style={{ ...A.pill, ...(sessionForm.opportunity_types.includes(t) ? A.pillActive : {}) }} onClick={() => toggleSessionArray('opportunity_types', t)}>{t}</button>
              ))}
            </div>
          </div>

          <div style={A.section}>
            <p style={A.sectionLabel}>Relevant interest tags</p>
            <div style={A.pillRow}>
              {INTERESTS.map(i => (
                <button key={i} style={{ ...A.pill, ...(sessionForm.interest_tags.includes(i) ? A.pillActive : {}) }} onClick={() => toggleSessionArray('interest_tags', i)}>{i}</button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button style={{ ...A.btnPrimary, opacity: sessionLoading ? 0.7 : 1 }} onClick={handleSessionSubmit} disabled={sessionLoading}>
              {sessionLoading ? 'Creating...' : 'Create session'}
            </button>
          </div>
        </div>
      )}

      {/* EMAILS TAB */}
      {tab === 'emails' && (
        <div>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: '#111', margin: '0 0 4px' }}>
                {applicants.length} total application records
              </p>
              <p style={{ fontSize: '13px', color: '#6b7280', margin: 0 }}>
                Use this list to mass email students who have applied to opportunities on Verto.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
              <button style={A.btnOutline} onClick={exportCSV}>
                ⬇ Export CSV
              </button>
              <button style={A.btnPrimary} onClick={copyEmails}>
                {emailCopied ? '✓ Copied!' : '📋 Copy user IDs'}
              </button>
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', padding: '12px 20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['User ID', 'Opportunity', 'Type', 'Applied'].map(h => (
                <span key={h} style={{ fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</span>
              ))}
            </div>
            {loadingApplicants ? (
              <p style={{ padding: '24px', color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
            ) : applicants.length === 0 ? (
              <p style={{ padding: '24px', color: '#9ca3af', fontSize: '14px' }}>No applications yet.</p>
            ) : (
              <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                {applicants.map((a, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 140px', padding: '12px 20px', borderBottom: '1px solid #f3f4f6', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#374151', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.user_id}</span>
                    <span style={{ fontSize: '13px', color: '#111', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.opportunities?.title || '—'}</span>
                    <span style={{ ...A.typeBadge, backgroundColor: typeColor(a.opportunities?.type), width: 'fit-content' }}>{a.opportunities?.type || '—'}</span>
                    <span style={{ fontSize: '12px', color: '#6b7280' }}>{new Date(a.applied_at).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: '16px', padding: '14px 18px', backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px' }}>
            <p style={{ fontSize: '13px', color: '#92400e', margin: 0, fontWeight: '500' }}>
              💡 To get actual emails: go to your Supabase dashboard → Authentication → Users → Export. Match user IDs from this list to get email addresses for your mass send.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

function typeColor(type) {
  const map = { scholarship: '#dcfce7', competition: '#dbeafe', internship: '#fef9c3', program: '#f3e8ff', grant: '#ffe4e6' }
  return map[type] || '#f3f4f6'
}

const A = {
  page: { maxWidth: '1100px', margin: '0 auto', padding: '80px 24px 80px', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" },
  pageTitle: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  statsRow: { display: 'grid', gap: '16px', marginBottom: '28px' },
  statCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' },
  tabs: { display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '24px', flexWrap: 'wrap' },
  tab: { padding: '8px 16px', borderRadius: '9px', border: 'none', backgroundColor: 'transparent', fontSize: '13px', fontWeight: '600', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' },
  tabActive: { backgroundColor: '#fff', color: '#111', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
  message: { padding: '12px 16px', borderRadius: '10px', border: '1.5px solid', fontSize: '13px', fontWeight: '500', marginBottom: '20px' },
  formCard: { backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '16px', padding: '28px' },
  formGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(280px, 100%), 1fr))', gap: '16px', marginBottom: '24px' },
  fieldFull: { gridColumn: '1 / -1' },
  label: { display: 'block', fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '14px', fontFamily: 'inherit', outline: 'none', backgroundColor: '#fafafa', boxSizing: 'border-box', transition: 'border-color 0.15s ease' },
  section: { marginBottom: '24px', paddingTop: '20px', borderTop: '1px solid #f3f4f6' },
  sectionLabel: { fontSize: '12px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 12px 0' },
  pillRow: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  pill: { padding: '6px 14px', borderRadius: '20px', border: '1.5px solid #e5e7eb', backgroundColor: '#fafafa', color: '#374151', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' },
  pillActive: { backgroundColor: '#064e3b', borderColor: '#064e3b', color: '#fff' },
  btnPrimary: { padding: '11px 24px', borderRadius: '10px', border: 'none', backgroundColor: '#064e3b', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease' },
  btnOutline: { padding: '11px 20px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', backgroundColor: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
  listCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', flexWrap: 'wrap' },
  typeBadge: { padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  actionBtn: { padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151', fontFamily: 'inherit', whiteSpace: 'nowrap' },
}