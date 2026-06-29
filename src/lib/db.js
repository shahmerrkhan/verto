export async function getOpportunities() {
  const res = await fetch('/api/opportunities')
  if (!res.ok) throw new Error('Failed to fetch opportunities')
  return res.json()
}

export async function getSaves(userId) {
  const res = await fetch(`/api/saves?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch saves')
  return res.json()
}

export async function saveOpportunity(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to save opportunity')
  return res.json()
}

export async function unsaveOpportunity(userId, opportunityId) {
  const res = await fetch(`/api/saves?userId=${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to unsave opportunity')
  return res.json()
}

export async function getApplications(userId) {
  const res = await fetch(`/api/applications?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch applications')
  return res.json()
}

export async function trackApplication(userId, opportunityId) {
  const res = await fetch(`/api/applications?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to track application')
  return res.json()
}

export async function updateProfile(userId, updates) {
  const res = await fetch('/api/profile-update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...updates }),
  })
  if (!res.ok) throw new Error('Failed to update profile')
  return res.json()
}

export async function logView(userId, opportunityId) {
  const res = await fetch('/api/views', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to log view')
  return res.json()
}

export async function getSaveMetadata(userId) {
  const res = await fetch(`/api/save-metadata?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch save metadata')
  return res.json()
}

export async function upsertSaveMetadata(userId, opportunityId, updates) {
  const res = await fetch(`/api/save-metadata?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId, updates }),
  })
  if (!res.ok) throw new Error('Failed to update save metadata')
  return res.json()
}

export async function getCollections(userId) {
  const res = await fetch(`/api/collections?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch collections')
  return res.json()
}

export async function createCollection(userId, name) {
  const res = await fetch(`/api/collections?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) return { data: null, error: true }
  return res.json()
}

export async function deleteCollection(userId, collectionId) {
  const res = await fetch(`/api/collections?userId=${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ collectionId }),
  })
  if (!res.ok) throw new Error('Failed to delete collection')
  return res.json()
}

export async function addToCollection(userId, opportunityId, collectionId) {
  const res = await fetch(`/api/opportunity-collections?userId=${userId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId, collectionId }),
  })
  if (!res.ok) return { error: true }
  return res.json()
}

export async function removeFromAllCollections(userId, opportunityId) {
  const res = await fetch(`/api/opportunity-collections?userId=${userId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ opportunityId }),
  })
  if (!res.ok) throw new Error('Failed to remove from collections')
  return res.json()
}

export async function getOpportunityCollections(userId) {
  const res = await fetch(`/api/opportunity-collections?userId=${userId}`)
  if (!res.ok) throw new Error('Failed to fetch opportunity collections')
  return res.json()
}

export async function awardBadges(userId, currentBadges, newBadgeIds) {
  const updated = [...new Set([...currentBadges, ...newBadgeIds])]
  const res = await fetch('/api/badges', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, badges: updated }),
  })
  if (!res.ok) throw new Error('Failed to award badges')
  return res.json()
}