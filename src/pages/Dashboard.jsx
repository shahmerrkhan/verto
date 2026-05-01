import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabase'
import OpportunityCard from '../components/OpportunityCard'
import { useNavigate } from 'react-router-dom'
import { rankOpportunitiesWithAI } from '../lib/aiMatcher'
import FilterBar from '../components/FilterBar'
import Toast from '../components/Toast'
import SortBar from '../components/SortBar'
import RecommendedSection from '../components/RecommendedSection'
import ProfileCompletion from '../components/ProfileCompletion'
import Logo from '../components/Logo'


export default function Dashboard() {
  const { user, profile, signOut } = useAuth()
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [saves, setSaves] = useState([])
  const [toast, setToast] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', type: 'all' })
  const [sortBy, setSortBy] = useState('relevance')
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])

  useEffect(() => {
    if (profile) {
      fetchOpportunities()
      fetchSaves()
      fetchApplications()
    }
  }, [profile])

  useEffect(() => {
    applyFilters(opportunities)
  }, [opportunities, filters])

  async function fetchOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('is_active', true)
    // Removed strict grade/province filters temporarily to verify data exists
  
  if (error) {
    console.error(error)
    setLoading(false)
    return
  }

  // Use the data directly to verify connection
  console.log("Opportunities found in DB:", data);
  
  setOpportunities(data)
  setLoading(false)
}

  async function fetchSaves() {
    const { data } = await supabase
      .from('saves')
      .select('opportunity_id')
      .eq('user_id', user.id)
    setSaves(data ? data.map(s => s.opportunity_id) : [])
  }

  async function fetchApplications() {
    const { data } = await supabase
      .from('applications')
      .select('opportunity_id')
      .eq('user_id', user.id)
    setApplications(data ? data.map(a => a.opportunity_id) : [])
  }

  function applyFilters(opps) {
    let result = opps

    if (filters.type !== 'all') {
      result = result.filter(op => op.type === filters.type)
    }

    if (filters.search.trim()) {
      const term = filters.search.toLowerCase()
      result = result.filter(op =>
        op.title.toLowerCase().includes(term) ||
        op.org_name.toLowerCase().includes(term) ||
        op.description.toLowerCase().includes(term)
      )
    }

    setFilteredOpportunities(result)
  }

  function handleFilterChange(newFilters) {
    setFilters(newFilters)
  }

  function getDaysUntilDeadline(deadline) {
    if (!deadline) return null
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const days = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24))
    return days
  }

  function getDeadlineUrgency(days) {
    if (days < 0) return 'expired'
    if (days <= 3) return 'urgent'
    if (days <= 7) return 'soon'
    return 'normal'
  }

  function handleSort(opportunities) {
    let sorted = [...opportunities]

    if (sortBy === 'deadline-asc') {
      sorted.sort((a, b) => {
        if (!a.deadline) return 1
        if (!b.deadline) return -1
        return new Date(a.deadline) - new Date(b.deadline)
      })
    } else if (sortBy === 'amount-desc') {
      sorted.sort((a, b) => (b.amount || 0) - (a.amount || 0))
    }

    return sorted
  }

  async function toggleSave(opportunityId) {
    const isSaved = saves.includes(opportunityId)

    if (isSaved) {
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)
      setSaves(saves.filter(id => id !== opportunityId))
      setToast({ message: 'Removed from saved', type: 'success' })
    } else {
      await supabase
        .from('saves')
        .insert({ user_id: user.id, opportunity_id: opportunityId })
      setSaves([...saves, opportunityId])
      setToast({ message: 'Added to saved', type: 'success' })
    }
  }

  async function trackApplication(opportunityId) {
    console.log("Attempting to track application for ID:", opportunityId);
    
    const { data, error } = await supabase
      .from('applications')
      .insert([{ 
        user_id: user.id, 
        opportunity_id: opportunityId 
      }])
      .select(); // This forces Supabase to return the result

    if (error) {
      console.error("SUPABASE ERROR:", error);
      // Removed the alert() so it doesn't annoy you
      setToast({ message: 'Failed to track application', type: 'error' });
    } else {
      // Removed the console.log("SUCCESS")
      setApplications([...applications, opportunityId]);
      setToast({ message: 'Application tracked!', type: 'success' });
    }

  }

  async function logView(opportunityId) {
    await supabase
      .from('opportunity_views')
      .insert({ user_id: user.id, opportunity_id: opportunityId })
  }


  if (loading) return <div style={styles.loading}>Finding your opportunities...</div>

  return (
    <div style={styles.container} className="container">
        <div style={styles.header} className="header">
                <div>
                  <Logo />
                  <p style={styles.greeting}>
                    Hey {profile?.full_name?.split(' ')[0] || 'there'}, here's what we found for you.
                  </p>
                </div>
        <div style={styles.headerButtons}>
          <button
          style={styles.profileBtn}
          onClick={() => navigate('/analytics')}
          onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
          onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
        >
          Analytics
        </button>
            <button
            style={styles.profileBtn}
            onClick={() => navigate('/profile')}
            onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
            >
            Profile
            </button>
            <button
            style={styles.savesBtn}
            onClick={() => navigate('/saves')}
            onMouseEnter={e => { e.target.style.backgroundColor = '#064e3b'; e.target.style.color = '#fff' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.color = '#064e3b' }}
            >
            Saved (★)
            </button>
            <button
            style={styles.signOutBtn}
            onClick={signOut}
            onMouseEnter={e => { e.target.style.backgroundColor = '#f3f4f6'; e.target.style.borderColor = '#ccc'; e.target.style.color = '#333' }}
            onMouseLeave={e => { e.target.style.backgroundColor = 'transparent'; e.target.style.borderColor = '#e0e0e0'; e.target.style.color = '#666' }}
            >
            Sign out
            </button>
            </div>
      </div>
      
      <ProfileCompletion profile={profile} />

      {opportunities.length > 0 && (
        <RecommendedSection
          opportunities={opportunities}
          topN={3}
          saves={saves}
          applications={applications}
          onToggleSave={toggleSave}
          onLogView={logView}
          onTrackApplication={trackApplication}
        />
      )}

      <FilterBar onFilterChange={handleFilterChange} opportunities={opportunities} />

      {filteredOpportunities.length === 0 ? (
  <div style={styles.empty}>
    {opportunities.length === 0 ? (
      <>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
          <circle cx="60" cy="60" r="48" fill="#f0fdf4" stroke="#bbf7d0" strokeWidth="2"/>
          <rect x="38" y="44" width="44" height="36" rx="6" fill="#fff" stroke="#6ee7b7" strokeWidth="1.5"/>
          <rect x="44" y="52" width="20" height="3" rx="1.5" fill="#34d399"/>
          <rect x="44" y="59" width="32" height="3" rx="1.5" fill="#d1fae5"/>
          <rect x="44" y="66" width="26" height="3" rx="1.5" fill="#d1fae5"/>
          <circle cx="78" cy="42" r="10" fill="#064e3b"/>
          <path d="M74 42l3 3 5-5" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <p style={styles.emptyTitle}>No opportunities yet</p>
        <p style={styles.emptySubtext}>Complete your profile so we can match you to the right ones</p>
        <button
          style={styles.emptyBtn}
          onClick={() => navigate('/profile')}
          onMouseEnter={e => e.target.style.transform = 'translateY(-1px)'}
          onMouseLeave={e => e.target.style.transform = 'translateY(0)'}
        >
          Complete profile →
        </button>
      </>
    ) : (
      <>
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
          <circle cx="60" cy="60" r="48" fill="#f9fafb" stroke="#e5e7eb" strokeWidth="2"/>
          <circle cx="54" cy="54" r="18" fill="#fff" stroke="#d1d5db" strokeWidth="2"/>
          <circle cx="54" cy="54" r="10" fill="#f3f4f6"/>
          <line x1="67" y1="67" x2="80" y2="80" stroke="#9ca3af" strokeWidth="3" strokeLinecap="round"/>
          <circle cx="54" cy="54" r="4" fill="#9ca3af"/>
        </svg>
        <p style={styles.emptyTitle}>No results found</p>
        <p style={styles.emptySubtext}>Try a different search term or clear your filters</p>
      </>
    )}
  </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <p style={styles.resultCount}>{filteredOpportunities.length} opportunity{filteredOpportunities.length !== 1 ? 's' : ''} found</p>
            <SortBar onSortChange={setSortBy} />
          </div>          
          <div style={styles.grid} className="grid">
            {handleSort(filteredOpportunities).map(op => (
              <OpportunityCard
                key={op.id}
                opportunity={op}
                isSaved={saves.includes(op.id)}
                isApplied={applications.includes(op.id)}
                onToggleSave={toggleSave}
                onLogView={logView}
                onTrackApplication={trackApplication}
                deadlineUrgency={getDeadlineUrgency(getDaysUntilDeadline(op.deadline))}
              />
            ))}
          </div>
        </>
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}

const styles = {
logo: {
  fontSize: '22px',
  fontWeight: '700',
  color: '#064e3b',
  marginBottom: '0px',
  letterSpacing: '-0.5px',
},
  greeting: {
    color: '#666',
    fontSize: '15px',
  },
  headerButtons: {
    display: 'flex',
    gap: '12px',
  },
  savesBtn: {
  padding: '9px 18px',
  borderRadius: '10px',
  border: '1.5px solid #064e3b',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: '#064e3b',
  transition: 'all 0.2s ease',
},
signOutBtn: {
  padding: '9px 18px',
  borderRadius: '10px',
  border: '1.5px solid #e0e0e0',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '500',
  color: '#666',
  transition: 'all 0.2s ease',
},
profileBtn: {
  padding: '9px 18px',
  borderRadius: '10px',
  border: '1.5px solid #064e3b',
  backgroundColor: 'transparent',
  cursor: 'pointer',
  fontSize: '14px',
  fontWeight: '600',
  color: '#064e3b',
  transition: 'all 0.2s ease',
},
emptyBtn: {
  marginTop: '16px',
  padding: '10px 20px',
  borderRadius: '10px',
  backgroundColor: '#064e3b',
  color: '#fff',
  border: 'none',
  fontSize: '14px',
  fontWeight: '600',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
},
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '16px',
  },
  loading: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#666',
    fontSize: '15px',
  },
  empty: {
    textAlign: 'center',
    padding: '80px 24px',
    color: '#888',
    fontSize: '15px',
  },
  emptySubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '8px',
  },
  resultCount: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1a1a1a',
    margin: '0',
  },
  logoContainer: {
    display: 'flex', 
    alignItems: 'center', 
    gap: '10px',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
    userSelect: 'none',
    width: 'fit-content', // Important: makes only the logo/text clickable, not the whole row
  },
  logoSvg: {
    transition: 'filter 0.3s ease',
  },
  logo: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#064e3b',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  emptyTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '8px',
  },
  
}

