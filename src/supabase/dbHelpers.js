import { supabase } from './supabase'
import { retryWithBackoff } from './retryLogic'
import { getCached, setCache, clearCache } from './queryOptimization'
import { encryptNotes, decryptNotes } from './encryption'
import { logError } from './monitoring'
import { saveArrayToOffline, getAllFromOffline, isOnline } from './offlineSupport'
import { queueRequest } from './requestQueuing'
import { trackSave, trackApplication, trackSearch } from './analytics'

function handleError(error, operation) {
  console.error(`DB Error (${operation}):`, error)
  logError(error, operation)
  return {
    error: {
      message: error.message || 'Database operation failed',
      code: error.code,
      operation,
    }
  }
}

// ─── PROFILE ────────────────────────────────────────────────────────────────

export async function getProfile(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    const cached = getCached(`profile:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    )
    
    if (error) return handleError(error, 'getProfile')
    if (data) {
      setCache(`profile:${userId}`, data)
      await saveArrayToOffline('profile', [data])
    }
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getProfile')
  }
}

export async function updateProfile(userId, updates) {
  try {
    if (!userId) throw new Error('User ID required')
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()
        .single()
    )
    
    if (error) return handleError(error, 'updateProfile')
    if (data) {
      setCache(`profile:${userId}`, data)
      await saveArrayToOffline('profile', [data])
    }
    clearCache('analytics')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'updateProfile')
  }
}

// ─── OPPORTUNITIES ───────────────────────────────────────────────────────────

export async function getOpportunities() {
  try {
    if (!isOnline()) {
      const offline = await getAllFromOffline('opportunities')
      return { data: offline || [], error: null }
    }

    const cached = getCached('opportunities')
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('opportunities')
        .select('*')
        .eq('is_active', true)
    )
    
    if (error) {
      const offline = await getAllFromOffline('opportunities')
      return { data: offline || [], error: null }
    }
    if (data) {
      setCache('opportunities', data, 10 * 60 * 1000)
      await saveArrayToOffline('opportunities', data)
    }
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getOpportunities')
  }
}

export async function getOpportunityById(id) {
  try {
    if (!id) throw new Error('Opportunity ID required')
    
    const cached = getCached(`opportunity:${id}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('opportunities')
        .select('*')
        .eq('id', id)
        .single()
    )
    
    if (error) return handleError(error, 'getOpportunityById')
    if (data) setCache(`opportunity:${id}`, data, 10 * 60 * 1000)
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getOpportunityById')
  }
}

// ─── SAVES ───────────────────────────────────────────────────────────────────

export async function getSaves(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    if (!isOnline()) {
      const offline = await getAllFromOffline('saves')
      return { data: offline || [], error: null }
    }

    const cached = getCached(`saves:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('saves')
        .select('opportunity_id, created_at')
        .eq('user_id', userId)
    )
    
    if (error) {
      const offline = await getAllFromOffline('saves')
      return { data: offline || [], error: null }
    }
    if (data) {
      setCache(`saves:${userId}`, data)
      await saveArrayToOffline('saves', data)
    }
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getSaves')
  }
}

export async function saveOpportunity(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      const savedAt = new Date().toISOString()
      
      await retryWithBackoff(() =>
        supabase
          .from('saves')
          .insert({ user_id: userId, opportunity_id: opportunityId, saved_at: savedAt })
      )
      
      await retryWithBackoff(() =>
        supabase
          .from('save_metadata')
          .upsert(
            { user_id: userId, opportunity_id: opportunityId, saved_at: savedAt },
            { onConflict: 'user_id,opportunity_id' }
          )
      )
      
      clearCache(`saves:${userId}`)
      clearCache('analytics')
      trackSave(opportunityId)
      return { error: null }
    } catch (err) {
      return handleError(err, 'saveOpportunity')
    }
  }, 'high')
}

export async function unsaveOpportunity(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('saves')
          .delete()
          .eq('user_id', userId)
          .eq('opportunity_id', opportunityId)
      )
      
      await retryWithBackoff(() =>
        supabase
          .from('save_metadata')
          .delete()
          .eq('user_id', userId)
          .eq('opportunity_id', opportunityId)
      )
      
      clearCache(`saves:${userId}`)
      clearCache('analytics')
      return { error: null }
    } catch (err) {
      return handleError(err, 'unsaveOpportunity')
    }
  }, 'high')
}

// ─── SAVE METADATA ───────────────────────────────────────────────────────────

export async function getSaveMetadata(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    if (!isOnline()) {
      const offline = await getAllFromOffline('metadata')
      return { data: offline || [], error: null }
    }

    const cached = getCached(`metadata:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('save_metadata')
        .select('*')
        .eq('user_id', userId)
    )
    
    if (error) {
      const offline = await getAllFromOffline('metadata')
      return { data: offline || [], error: null }
    }
    
    const decrypted = data?.map(item => ({
      ...item,
      notes: item.notes ? decryptNotes(item.notes) : item.notes
    })) || []
    
    if (decrypted) {
      setCache(`metadata:${userId}`, decrypted)
      await saveArrayToOffline('metadata', decrypted)
    }
    return { data: decrypted, error: null }
  } catch (err) {
    return handleError(err, 'getSaveMetadata')
  }
}

export async function upsertSaveMetadata(userId, opportunityId, updates) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      
      const updatePayload = {
        ...updates,
        notes: updates.notes ? encryptNotes(updates.notes) : updates.notes,
        updated_at: new Date().toISOString()
      }
      
      const { data, error } = await retryWithBackoff(() =>
        supabase
          .from('save_metadata')
          .upsert(
            { user_id: userId, opportunity_id: opportunityId, ...updatePayload },
            { onConflict: 'user_id,opportunity_id' }
          )
          .select()
          .single()
      )
      
      if (error) return handleError(error, 'upsertSaveMetadata')
      
      const decrypted = data ? {
        ...data,
        notes: data.notes ? decryptNotes(data.notes) : data.notes
      } : data
      
      clearCache(`metadata:${userId}`)
      clearCache('analytics')
      return { data: decrypted, error: null }
    } catch (err) {
      return handleError(err, 'upsertSaveMetadata')
    }
  }, 'normal')
}

// ─── APPLICATIONS ────────────────────────────────────────────────────────────

export async function getApplications(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    if (!isOnline()) {
      const offline = await getAllFromOffline('applications')
      return { data: offline || [], error: null }
    }

    const cached = getCached(`applications:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('applications')
        .select('opportunity_id, created_at, applied_at')
        .eq('user_id', userId)
    )
    
    if (error) {
      const offline = await getAllFromOffline('applications')
      return { data: offline || [], error: null }
    }
    if (data) {
      setCache(`applications:${userId}`, data)
      await saveArrayToOffline('applications', data)
    }
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getApplications')
  }
}

export async function trackApplication(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      const appliedAt = new Date().toISOString()
      
      await retryWithBackoff(() =>
        supabase
          .from('applications')
          .insert({ user_id: userId, opportunity_id: opportunityId, applied_at: appliedAt })
      )
      
      await retryWithBackoff(() =>
        supabase
          .from('save_metadata')
          .upsert(
            { user_id: userId, opportunity_id: opportunityId, applied_at: appliedAt, is_applied: true, application_status: 'applied' },
            { onConflict: 'user_id,opportunity_id' }
          )
      )
      
      clearCache(`applications:${userId}`)
      clearCache(`metadata:${userId}`)
      clearCache('analytics')
      trackApplication(opportunityId)
      return { error: null }
    } catch (err) {
      return handleError(err, 'trackApplication')
    }
  }, 'high')
}

export async function deleteApplication(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('applications')
          .delete()
          .eq('user_id', userId)
          .eq('opportunity_id', opportunityId)
      )
      
      clearCache(`applications:${userId}`)
      clearCache('analytics')
      return { error: null }
    } catch (err) {
      return handleError(err, 'deleteApplication')
    }
  }, 'normal')
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

export async function logView(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('opportunity_views')
          .insert({ user_id: userId, opportunity_id: opportunityId })
      )
      
      clearCache('analytics')
      return { error: null }
    } catch (err) {
      return handleError(err, 'logView')
    }
  }, 'normal')
}

export async function getViews(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    const cached = getCached(`views:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('opportunity_views')
        .select('opportunity_id, created_at')
        .eq('user_id', userId)
    )
    
    if (error) return handleError(error, 'getViews')
    if (data) setCache(`views:${userId}`, data)
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getViews')
  }
}

// ─── COLLECTIONS ─────────────────────────────────────────────────────────────

export async function getCollections(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    if (!isOnline()) {
      const offline = await getAllFromOffline('collections')
      return { data: offline || [], error: null }
    }

    const cached = getCached(`collections:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('collections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
    )
    
    if (error) {
      const offline = await getAllFromOffline('collections')
      return { data: offline || [], error: null }
    }
    if (data) {
      setCache(`collections:${userId}`, data)
      await saveArrayToOffline('collections', data)
    }
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getCollections')
  }
}

export async function createCollection(userId, name) {
  return queueRequest(async () => {
    try {
      if (!userId || !name) throw new Error('User ID and collection name required')
      
      const { data, error } = await retryWithBackoff(() =>
        supabase
          .from('collections')
          .insert({ user_id: userId, name })
          .select()
          .single()
      )
      
      if (error) return handleError(error, 'createCollection')
      clearCache(`collections:${userId}`)
      return { data, error: null }
    } catch (err) {
      return handleError(err, 'createCollection')
    }
  }, 'normal')
}

export async function deleteCollection(userId, collectionId) {
  return queueRequest(async () => {
    try {
      if (!userId || !collectionId) throw new Error('User ID and Collection ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('opportunity_collections')
          .delete()
          .eq('collection_id', collectionId)
          .eq('user_id', userId)
      )
      
      await retryWithBackoff(() =>
        supabase
          .from('collections')
          .delete()
          .eq('id', collectionId)
          .eq('user_id', userId)
      )
      
      clearCache(`collections:${userId}`)
      return { error: null }
    } catch (err) {
      return handleError(err, 'deleteCollection')
    }
  }, 'normal')
}

export async function addToCollection(userId, opportunityId, collectionId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId || !collectionId) throw new Error('User ID, Opportunity ID, and Collection ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('opportunity_collections')
          .insert({ user_id: userId, opportunity_id: opportunityId, collection_id: collectionId })
      )
      
      clearCache(`collections:${userId}`)
      return { error: null }
    } catch (err) {
      return handleError(err, 'addToCollection')
    }
  }, 'normal')
}

export async function removeFromAllCollections(userId, opportunityId) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
      
      await retryWithBackoff(() =>
        supabase
          .from('opportunity_collections')
          .delete()
          .eq('opportunity_id', opportunityId)
          .eq('user_id', userId)
      )
      
      clearCache(`collections:${userId}`)
      return { error: null }
    } catch (err) {
      return handleError(err, 'removeFromAllCollections')
    }
  }, 'normal')
}

export async function getOpportunityCollections(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    const cached = getCached(`opp-collections:${userId}`)
    if (cached) return { data: cached, error: null }
    
    const { data, error } = await retryWithBackoff(() =>
      supabase
        .from('opportunity_collections')
        .select('opportunity_id, collection_id')
        .eq('user_id', userId)
    )
    
    if (error) return handleError(error, 'getOpportunityCollections')
    if (data) setCache(`opp-collections:${userId}`, data)
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getOpportunityCollections')
  }
}

// ─── BADGES ──────────────────────────────────────────────────────────────────

export async function awardBadges(userId, currentBadges, newBadgeIds) {
  return queueRequest(async () => {
    try {
      if (!userId || !Array.isArray(newBadgeIds)) throw new Error('User ID and badge IDs required')
      const merged = [...new Set([...currentBadges, ...newBadgeIds])]
      
      await retryWithBackoff(() =>
        supabase
          .from('profiles')
          .update({ badges: merged })
          .eq('id', userId)
      )
      
      clearCache(`profile:${userId}`)
      return { error: null, merged }
    } catch (err) {
      return handleError(err, 'awardBadges')
    }
  }, 'high')
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getAnalytics(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    
    const cached = getCached(`analytics:${userId}`)
    if (cached) return cached
    
    const [viewsRes, savesRes, appsRes, metaRes] = await Promise.all([
      retryWithBackoff(() => supabase.from('opportunity_views').select('opportunity_id, created_at').eq('user_id', userId)),
      retryWithBackoff(() => supabase.from('saves').select('opportunity_id, created_at').eq('user_id', userId)),
      retryWithBackoff(() => supabase.from('applications').select('opportunity_id, created_at, applied_at').eq('user_id', userId)),
      retryWithBackoff(() => supabase.from('save_metadata').select('*').eq('user_id', userId)),
    ])
    
    const decryptedMeta = (metaRes.data || []).map(item => ({
      ...item,
      notes: item.notes ? decryptNotes(item.notes) : item.notes
    }))
    
    const result = {
      views: viewsRes.data || [],
      saves: savesRes.data || [],
      applications: appsRes.data || [],
      metadata: decryptedMeta,
      error: null
    }
    
    setCache(`analytics:${userId}`, result, 2 * 60 * 1000)
    return result
  } catch (err) {
    return handleError(err, 'getAnalytics')
  }
}

// ─── USER ACTIVITY ────────────────────────────────────────────────────────────

export async function logActivity(userId, opportunityId, actionType) {
  return queueRequest(async () => {
    try {
      if (!userId || !opportunityId || !actionType) throw new Error('User ID, Opportunity ID, and action type required')
      
      await retryWithBackoff(() =>
        supabase
          .from('user_activity')
          .insert({ user_id: userId, opportunity_id: opportunityId, action_type: actionType })
      )
      
      return { error: null }
    } catch (err) {
      return handleError(err, 'logActivity')
    }
  }, 'normal')
}