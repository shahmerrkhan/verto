import { createContext, useContext, useEffect, useState } from 'react'
import { useUser, useClerk } from '@clerk/clerk-react'

const AuthContext = createContext({})

export function AuthProvider({ children }) {
  const { user: clerkUser, isLoaded } = useUser()
  const { signOut: clerkSignOut } = useClerk()
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    if (!clerkUser) {
      setProfile(null)
      return
    }
    fetchProfile(clerkUser.id)
  }, [clerkUser, isLoaded])

  async function fetchProfile(userId) {
    try {
      setProfileLoading(true)
      const res = await fetch(`/api/profile?userId=${userId}`)
      if (!res.ok) return
      const data = await res.json()
      setProfile(data)
    } catch (err) {
      console.error('Failed to fetch profile:', err)
    } finally {
      setProfileLoading(false)
    }
  }

  async function refreshProfile() {
    if (clerkUser) await fetchProfile(clerkUser.id)
  }

  async function signOut() {
    setProfile(null)
    await clerkSignOut()
  }

  return (
    <AuthContext.Provider value={{
      user: clerkUser ?? null,
      profile,
      loading: !isLoaded || profileLoading,
      signOut,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}