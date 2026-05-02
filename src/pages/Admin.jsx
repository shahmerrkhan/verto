import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import { useNavigate } from 'react-router-dom'
import Logo from '../components/Logo'

const TYPES = ['scholarship', 'competition', 'internship', 'program', 'grant']
const PROVINCES = ['ALL', 'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
const GRADES = [9, 10, 11, 12]
const INTERESTS = [
  'Software & Tech', 'Engineering', 'Science & Research', 'Business & Entrepreneurship',
  'Arts & Design', 'Law & Politics', 'Medicine & Health', 'Environment & Sustainability',
  'Education', 'Social Justice & Community', 'Mathematics', 'Writing & Journalism'
]

const EMPTY_FORM = {
  title: '', org_name: '', description: '', type: 'scholarship',
  deadline: '', amount: '', url: '', requires_essay: false,
  province_scope: ['ALL'], grade_scope: [9, 10, 11, 12],
  interest_tags: [], is_active: true,
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

  useEffect(() => {
    if (tab === 'manage') fetchAll()
  }, [tab])

  async function fetchAll() {
    setLoadingList(true)
    const { data } = await supabase.from('opportunities').select('*').order('created_at', { ascending: false })
    setOpportunities(data || [])
    setLoadingList(false)
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
    let error
    if (editingId) {
      ;({ error } = await supabase.from('opportunities').update(payload).eq('id', editingId))
    } else {
      ;({ error } = await supabase.from('opportunities').insert([payload]))
    }
    setLoading(false)
    if (error) {
      setMessage({ type: 'error', text: error.message })
    } else {
      setMessage({ type: 'success', text: editingId ? 'Opportunity updated!' : 'Opportunity added!' })
      setForm(EMPTY_FORM)
      setEditingId(null)
      if (tab === 'manage') fetchAll()
    }
  }

  async function toggleActive(id, current) {
    await supabase.from('opportunities').update({ is_active: !current }).eq('id', id)
    setOpportunities(opportunities.map(op => op.id === id ? { ...op, is_active: !current } : op))
  }

  async function deleteOpp(id) {
    if (!window.confirm('Delete this opportunity? This cannot be undone.')) return
    await supabase.from('opportunities').delete().eq('id', id)
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

  return (
    <div style={A.page}>
      {/* Header */}
      <div style={A.header}>
        <Logo />
        <div style={{ display: 'flex', gap: '10px' }}>
          <button style={A.btnOutline} onClick={() => navigate('/dashboard')}>← Dashboard</button>
          <button style={A.btnGhost} onClick={signOut}>Sign out</button>
        </div>
      </div>

      <div style={A.pageTitle}>
        <h1 style={A.title}>Admin panel</h1>
        <p style={A.subtitle}>Manage opportunities across the platform</p>
      </div>

      {/* Stats row */}
      <div style={A.statsRow}>
        {[
          { label: 'Total opportunities', value: opportunities.length },
          { label: 'Active', value: opportunities.filter(o => o.is_active).length },
          { label: 'Inactive', value: opportunities.filter(o => !o.is_active).length },
        ].map(s => (
          <div key={s.label} style={A.statCard}>
            <p style={A.statValue}>{s.value}</p>
            <p style={A.statLabel}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={A.tabs}>
        <button style={{ ...A.tab, ...(tab === 'add' ? A.tabActive : {}) }} onClick={() => setTab('add')}>
          {editingId ? '✏️ Edit opportunity' : '+ Add opportunity'}
        </button>
        <button style={{ ...A.tab, ...(tab === 'manage' ? A.tabActive : {}) }} onClick={() => setTab('manage')}>
          📋 Manage ({opportunities.length})
        </button>
      </div>

      {/* Message */}
      {message && (
        <div style={{ ...A.message, backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4', borderColor: message.type === 'error' ? '#fecaca' : '#bbf7d0', color: message.type === 'error' ? '#dc2626' : '#166534' }}>
          {message.text}
        </div>
      )}

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
                  <button key={t} style={{ ...A.pill, ...(form.type === t ? A.pillActive : {}) }} onClick={() => setForm({ ...form, type: t })}>
                    {t}
                  </button>
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
                }}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={A.section}>
            <p style={A.sectionLabel}>Grade scope</p>
            <div style={A.pillRow}>
              {GRADES.map(g => (
                <button key={g} style={{ ...A.pill, ...(form.grade_scope.includes(g) ? A.pillActive : {}) }} onClick={() => toggleArray('grade_scope', g)}>
                  Grade {g}
                </button>
              ))}
            </div>
          </div>

          <div style={A.section}>
            <p style={A.sectionLabel}>Interest tags</p>
            <div style={A.pillRow}>
              {INTERESTS.map(i => (
                <button key={i} style={{ ...A.pill, ...(form.interest_tags.includes(i) ? A.pillActive : {}) }} onClick={() => toggleArray('interest_tags', i)}>
                  {i}
                </button>
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
                  <div
                    onClick={() => setForm({ ...form, [opt.key]: !form[opt.key] })}
                    style={{ width: '20px', height: '20px', borderRadius: '6px', border: '1.5px solid', borderColor: form[opt.key] ? '#064e3b' : '#d1d5db', backgroundColor: form[opt.key] ? '#064e3b' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease' }}>
                    {form[opt.key] && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '700' }}>✓</span>}
                  </div>
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            {editingId && (
              <button style={A.btnGhost} onClick={() => { setEditingId(null); setForm(EMPTY_FORM) }}>Cancel</button>
            )}
            <button style={{ ...A.btnPrimary, opacity: loading ? 0.7 : 1 }} onClick={handleSubmit} disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update opportunity' : 'Add opportunity'}
            </button>
          </div>
        </div>
      )}

      {tab === 'manage' && (
        <div>
          <input
            type="text"
            placeholder="Search by title or organization..."
            value={searchList}
            onChange={e => setSearchList(e.target.value)}
            style={{ ...A.input, marginBottom: '20px', maxWidth: '400px' }}
          />
          {loadingList ? (
            <p style={{ color: '#9ca3af', fontSize: '14px' }}>Loading...</p>
          ) : (
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
                    <button style={{ ...A.actionBtn, color: op.is_active ? '#6b7280' : '#064e3b' }} onClick={() => toggleActive(op.id, op.is_active)}>
                      {op.is_active ? 'Deactivate' : 'Activate'}
                    </button>
                    <button style={{ ...A.actionBtn, color: '#dc2626' }} onClick={() => deleteOpp(op.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && <p style={{ color: '#9ca3af', fontSize: '14px' }}>No results found.</p>}
            </div>
          )}
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
  page: { maxWidth: '1100px', margin: '0 auto', padding: '40px 24px 80px', fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' },
  pageTitle: { marginBottom: '28px' },
  title: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 6px 0', letterSpacing: '-0.5px' },
  subtitle: { fontSize: '15px', color: '#6b7280', margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '28px' },
  statCard: { backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '14px', padding: '20px 24px' },
  statValue: { fontSize: '28px', fontWeight: '700', color: '#111', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  statLabel: { fontSize: '13px', color: '#6b7280', margin: 0, fontWeight: '500' },
  tabs: { display: 'flex', gap: '4px', backgroundColor: '#f3f4f6', borderRadius: '12px', padding: '4px', marginBottom: '24px', width: 'fit-content' },
  tab: { padding: '8px 20px', borderRadius: '9px', border: 'none', backgroundColor: 'transparent', fontSize: '14px', fontWeight: '600', color: '#6b7280', cursor: 'pointer', transition: 'all 0.15s ease', fontFamily: 'inherit' },
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
  btnOutline: { padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #064e3b', backgroundColor: 'transparent', color: '#064e3b', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' },
  btnGhost: { padding: '8px 16px', borderRadius: '10px', border: '1.5px solid #e5e7eb', backgroundColor: 'transparent', color: '#6b7280', fontSize: '13px', fontWeight: '500', cursor: 'pointer', fontFamily: 'inherit' },
  listCard: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px', backgroundColor: '#fff', border: '1.5px solid #e5e7eb', borderRadius: '12px', flexWrap: 'wrap' },
  typeBadge: { padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700', textTransform: 'capitalize' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0 },
  actionBtn: { padding: '6px 14px', borderRadius: '8px', border: '1.5px solid #e5e7eb', backgroundColor: '#fff', fontSize: '13px', fontWeight: '600', cursor: 'pointer', color: '#374151', fontFamily: 'inherit', whiteSpace: 'nowrap' },
}