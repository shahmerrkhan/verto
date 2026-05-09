import { supabase } from './supabase'

function handleError(error, operation) {
  console.error(`DB Error (${operation}):`, error)
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
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error) return handleError(error, 'getProfile')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getProfile')
  }
}

export async function updateProfile(userId, updates) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    if (error) return handleError(error, 'updateProfile')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'updateProfile')
  }
}

// ─── OPPORTUNITIES ───────────────────────────────────────────────────────────

export async function getOpportunities() {
  try {
    // Try online first
    if (isOnline()) {
      const cached = getCached('opportunities')
      if (cached) return { data: cached, error: null }
      
      const { data, error } = await retryWithBackoff(() =>
        supabase
          .from('opportunities')
          .select('*')
          .eq('is_active', true)
      )
      
      if (error) {
        // Fall back to offline if online fails
        const offline = await getAllFromOffline('opportunities')
        return { data: offline || [], error: null }
      }
      if (data) {
        setCache('opportunities', data, 10 * 60 * 1000)
        await saveArrayToOffline('opportunities', data)
      }
      return { data, error: null }
    } else {
      // Offline mode
      const offline = await getAllFromOffline('opportunities')
      return { data: offline || [], error: null }
    }
  } catch (err) {
    return handleError(err, 'getOpportunities')
  }
}

export async function getOpportunityById(id) {
  try {
    if (!id) throw new Error('Opportunity ID required')
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .single()
    if (error) return handleError(error, 'getOpportunityById')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getOpportunityById')
  }
}

// ─── SAVES ───────────────────────────────────────────────────────────────────

export async function getSaves(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('saves')
      .select('opportunity_id, created_at')
      .eq('user_id', userId)
    if (error) return handleError(error, 'getSaves')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getSaves')
  }
}

export async function saveOpportunity(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const savedAt = new Date().toISOString()
    const { error: saveError } = await supabase
      .from('saves')
      .insert({ user_id: userId, opportunity_id: opportunityId, saved_at: savedAt })
    if (saveError) return handleError(saveError, 'saveOpportunity')
    const { error: metaError } = await supabase
      .from('save_metadata')
      .upsert(
        { user_id: userId, opportunity_id: opportunityId, saved_at: savedAt },
        { onConflict: 'user_id,opportunity_id' }
      )
    if (metaError) return handleError(metaError, 'saveOpportunity')
    return { error: null }
  } catch (err) {
    return handleError(err, 'saveOpportunity')
  }
}

export async function unsaveOpportunity(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const { error: saveError } = await supabase
      .from('saves')
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
    if (saveError) return handleError(saveError, 'unsaveOpportunity')
    const { error: metaError } = await supabase
      .from('save_metadata')
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
    if (metaError) return handleError(metaError, 'unsaveOpportunity')
    return { error: null }
  } catch (err) {
    return handleError(err, 'unsaveOpportunity')
  }
}

// ─── SAVE METADATA ───────────────────────────────────────────────────────────

export async function getSaveMetadata(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('save_metadata')
      .select('*')
      .eq('user_id', userId)
    if (error) return handleError(error, 'getSaveMetadata')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getSaveMetadata')
  }
}

export async function upsertSaveMetadata(userId, opportunityId, updates) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const { data, error } = await supabase
      .from('save_metadata')
      .upsert(
        { user_id: userId, opportunity_id: opportunityId, ...updates, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,opportunity_id' }
      )
      .select()
      .single()
    if (error) return handleError(error, 'upsertSaveMetadata')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'upsertSaveMetadata')
  }
}

// ─── APPLICATIONS ────────────────────────────────────────────────────────────

export async function getApplications(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('applications')
      .select('opportunity_id, created_at, applied_at')
      .eq('user_id', userId)
    if (error) return handleError(error, 'getApplications')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getApplications')
  }
}

export async function trackApplication(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const appliedAt = new Date().toISOString()
    const { error: appError } = await supabase
      .from('applications')
      .insert({ user_id: userId, opportunity_id: opportunityId, applied_at: appliedAt })
    if (appError) return handleError(appError, 'trackApplication')
    const { error: metaError } = await supabase
      .from('save_metadata')
      .upsert(
        { user_id: userId, opportunity_id: opportunityId, applied_at: appliedAt, is_applied: true },
        { onConflict: 'user_id,opportunity_id' }
      )
    if (metaError) return handleError(metaError, 'trackApplication')
    return { error: null }
  } catch (err) {
    return handleError(err, 'trackApplication')
  }
}

export async function deleteApplication(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
    if (error) return handleError(error, 'deleteApplication')
    return { error: null }
  } catch (err) {
    return handleError(err, 'deleteApplication')
  }
}

// ─── VIEWS ───────────────────────────────────────────────────────────────────

export async function logView(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const { error } = await supabase
      .from('opportunity_views')
      .insert({ user_id: userId, opportunity_id: opportunityId })
    if (error) return handleError(error, 'logView')
    return { error: null }
  } catch (err) {
    return handleError(err, 'logView')
  }
}

export async function getViews(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('opportunity_views')
      .select('opportunity_id, created_at')
      .eq('user_id', userId)
    if (error) return handleError(error, 'getViews')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getViews')
  }
}

// ─── COLLECTIONS ─────────────────────────────────────────────────────────────

export async function getCollections(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('collections')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    if (error) return handleError(error, 'getCollections')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getCollections')
  }
}

export async function createCollection(userId, name) {
  try {
    if (!userId || !name) throw new Error('User ID and collection name required')
    const { data, error } = await supabase
      .from('collections')
      .insert({ user_id: userId, name })
      .select()
      .single()
    if (error) return handleError(error, 'createCollection')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'createCollection')
  }
}

export async function deleteCollection(userId, collectionId) {
  try {
    if (!userId || !collectionId) throw new Error('User ID and Collection ID required')
    await supabase
      .from('opportunity_collections')
      .delete()
      .eq('collection_id', collectionId)
      .eq('user_id', userId)
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', collectionId)
      .eq('user_id', userId)
    if (error) return handleError(error, 'deleteCollection')
    return { error: null }
  } catch (err) {
    return handleError(err, 'deleteCollection')
  }
}

export async function addToCollection(userId, opportunityId, collectionId) {
  try {
    if (!userId || !opportunityId || !collectionId) throw new Error('User ID, Opportunity ID, and Collection ID required')
    const { error } = await supabase
      .from('opportunity_collections')
      .insert({ user_id: userId, opportunity_id: opportunityId, collection_id: collectionId })
    if (error) return handleError(error, 'addToCollection')
    return { error: null }
  } catch (err) {
    return handleError(err, 'addToCollection')
  }
}

export async function removeFromAllCollections(userId, opportunityId) {
  try {
    if (!userId || !opportunityId) throw new Error('User ID and Opportunity ID required')
    const { error } = await supabase
      .from('opportunity_collections')
      .delete()
      .eq('opportunity_id', opportunityId)
      .eq('user_id', userId)
    if (error) return handleError(error, 'removeFromAllCollections')
    return { error: null }
  } catch (err) {
    return handleError(err, 'removeFromAllCollections')
  }
}

export async function getOpportunityCollections(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const { data, error } = await supabase
      .from('opportunity_collections')
      .select('opportunity_id, collection_id')
      .eq('user_id', userId)
    if (error) return handleError(error, 'getOpportunityCollections')
    return { data, error: null }
  } catch (err) {
    return handleError(err, 'getOpportunityCollections')
  }
}

// ─── BADGES ──────────────────────────────────────────────────────────────────

export async function awardBadges(userId, currentBadges, newBadgeIds) {
  try {
    if (!userId || !Array.isArray(newBadgeIds)) throw new Error('User ID and badge IDs required')
    const merged = [...new Set([...currentBadges, ...newBadgeIds])]
    const { error } = await supabase
      .from('profiles')
      .update({ badges: merged })
      .eq('id', userId)
    if (error) return handleError(error, 'awardBadges')
    return { error: null, merged }
  } catch (err) {
    return handleError(err, 'awardBadges')
  }
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────

export async function getAnalytics(userId) {
  try {
    if (!userId) throw new Error('User ID required')
    const [viewsRes, savesRes, appsRes, metaRes] = await Promise.all([
      supabase.from('opportunity_views').select('opportunity_id, created_at').eq('user_id', userId),
      supabase.from('saves').select('opportunity_id, created_at').eq('user_id', userId),
      supabase.from('applications').select('opportunity_id, created_at, applied_at').eq('user_id', userId),
      supabase.from('save_metadata').select('*').eq('user_id', userId),
    ])
    return {
      views: viewsRes.data || [],
      saves: savesRes.data || [],
      applications: appsRes.data || [],
      metadata: metaRes.data || [],
      error: null
    }
  } catch (err) {
    return handleError(err, 'getAnalytics')
  }
}

// ─── USER ACTIVITY ────────────────────────────────────────────────────────────

export async function logActivity(userId, opportunityId, actionType) {
  try {
    if (!userId || !opportunityId || !actionType) throw new Error('User ID, Opportunity ID, and action type required')
    const { error } = await supabase
      .from('user_activity')
      .insert({ user_id: userId, opportunity_id: opportunityId, action_type: actionType })
    if (error) return handleError(error, 'logActivity')
    return { error: null }
  } catch (err) {
    return handleError(err, 'logActivity')
  }
}