async function authHeaders() {
  const token = await window.Clerk?.session?.getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export async function getOpportunities() {
  const res = await fetch('/api/opportunities')
  if (!res.ok) throw new Error('Failed to fetch opportunities')
  return res.json()
}

export async function getSaves(userId) {
  const res = await fetch(`/api/saves?userId=${userId}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch saves')
  return res.json()
}

export async function saveOpportunity(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to save opportunity')
  return res.json()
}

export async function unsaveOpportunity(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to unsave opportunity')
  return res.json()
}

export async function getApplications(userId) {
  const res = await fetch(`/api/profile?action=applications&userId=${userId}`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

export async function trackApplication(userId, opportunityId) {
    const res = await fetch(`/api/profile?action=applications&userId=${userId}`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to track application')
  return res.json()
}

export async function updateProfile(userId, updates) {
  const res = await fetch('/api/profile-update', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ userId, ...updates }),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function logView(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=views`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to log view')
  return res.json()
}

export async function getSaveMetadata(userId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=metadata`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch save metadata')
  return res.json()
}

export async function upsertSaveMetadata(userId, opportunityId, updates) {
  const res = await fetch(`/api/saves?userId=${userId}&action=metadata`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId, updates }),
  })
  if (!res.ok) throw new Error('Failed to update save metadata')
  return res.json()
}

export async function getCollections(userId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=collections`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch collections')
  return res.json()
}

export async function createCollection(userId, name) {
  const res = await fetch(`/api/saves?userId=${userId}&action=collections`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ name }),
  })
  if (!res.ok) return { data: null, error: true }
  return res.json()
}

export async function deleteCollection(userId, collectionId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=collections`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ collectionId }),
  })
  if (!res.ok) throw new Error('Failed to delete collection')
  return res.json()
}

export async function addToCollection(userId, opportunityId, collectionId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=opportunity-collections`, {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId, collectionId }),
  })
  if (!res.ok) return { error: true }
  return res.json()
}

export async function removeFromAllCollections(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=opportunity-collections`, {
    method: 'DELETE',
    headers: await authHeaders(),
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to remove from collections')
  return res.json()
}

export async function getOpportunityCollections(userId) {
  const res = await fetch(`/api/saves?userId=${userId}&action=opportunity-collections`, { headers: await authHeaders() })
  if (!res.ok) throw new Error('Failed to fetch opportunity collections')
  return res.json()
}

export async function awardBadges(userId, currentBadges, newBadgeIds) {
  const updated = [...new Set([...currentBadges, ...newBadgeIds])]
  const res = await fetch('/api/profile?action=badges', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ userId, badges: updated }),
  })
  if (!res.ok) throw new Error('Failed to award badges')
  return res.json()
}