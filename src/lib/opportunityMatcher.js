/**
 * Local match scoring — no API needed.
 * Max possible before bonuses/penalties: 100pts
 * Interest (40) + Grade (20) + Province (20) + Type pref (20)
 * Bonus: high value (+5), GPA match (+10)
 * Penalty: essay (-5)
 */

export function calculateMatchScore(opportunity, userProfile) {
  if (!opportunity || !userProfile) return 0

  let score = 0

  // --- INTEREST MATCH (40 pts) ---
  const userInterests = (userProfile.interests || []).map(i => i.toLowerCase())
  const oppTags = Array.isArray(opportunity.interest_tags)
    ? opportunity.interest_tags.map(t => t.toLowerCase())
    : typeof opportunity.interest_tags === 'string'
    ? opportunity.interest_tags.split(',').map(t => t.trim().toLowerCase())
    : []
  const oppCategory = (opportunity.category || opportunity.type || '').toLowerCase()

  if (userInterests.length > 0 && (oppTags.length > 0 || oppCategory)) {
    const tagMatches = oppTags.filter(tag =>
      userInterests.some(i => tag.includes(i) || i.includes(tag))
    ).length

    const categoryMatch = userInterests.some(i =>
      oppCategory.includes(i) || i.includes(oppCategory)
    )

    const interestScore = Math.min(
      (oppTags.length > 0 ? (tagMatches / oppTags.length) * 30 : 0) + (categoryMatch ? 10 : 0),
      40
    )
    score += interestScore
  }

  // --- GRADE FIT (20 pts) ---
  const userGrade = parseInt(userProfile.grade, 10)
  const gradeScope = Array.isArray(opportunity.grade_scope)
    ? opportunity.grade_scope.map(g => parseInt(g, 10))
    : opportunity.grade_scope
    ? [parseInt(opportunity.grade_scope, 10)]
    : []
  const minGrade = opportunity.min_grade ? parseInt(opportunity.min_grade, 10) : null
  const maxGrade = opportunity.max_grade ? parseInt(opportunity.max_grade, 10) : null

  if (!isNaN(userGrade)) {
    if (gradeScope.length > 0) {
      if (gradeScope.includes(userGrade)) score += 20
      else if (gradeScope.some(g => Math.abs(g - userGrade) === 1)) score += 8
    } else if (minGrade !== null && maxGrade !== null) {
      if (userGrade >= minGrade && userGrade <= maxGrade) score += 20
      else if (userGrade === minGrade - 1 || userGrade === maxGrade + 1) score += 8
    } else {
      score += 10 // no grade restriction = open to everyone
    }
  }

  // --- PROVINCE FIT (20 pts) ---
  const userProvince = (userProfile.province || '').toLowerCase()
  const location = (opportunity.location || '').toLowerCase()
  const provinceScope = Array.isArray(opportunity.province_scope)
    ? opportunity.province_scope.map(p => p.toLowerCase())
    : opportunity.province_scope
    ? [opportunity.province_scope.toLowerCase()]
    : []

  const isRemote = location.includes('remote') || location.includes('online') || location.includes('virtual')
  const isNational = location.includes('canada') || location.includes('national') || location === '' || location.includes('all provinces')

  if (isRemote || isNational) {
    score += 20
  } else if (provinceScope.length > 0) {
    if (userProvince && provinceScope.includes(userProvince)) score += 20
  } else if (userProvince && location.includes(userProvince)) {
    score += 20
  }

  // --- TYPE PREFERENCE (20 pts) ---
  const preferredTypes = userProfile.preferred_types || []
  if (preferredTypes.length > 0 && opportunity.type) {
    if (preferredTypes.includes(opportunity.type)) score += 20
  } else {
    // no stated preference = neutral, give half credit
    score += 10
  }

  // --- BONUSES ---
  if ((opportunity.amount || 0) >= 5000) score += 5 // high value

  const userGPAStr = userProfile.gpa_range || ''
  const userGPAMin = parseFloat(userGPAStr.split('-')[0]) || null
  const oppMinGPA = opportunity.gpa_scope?.min || opportunity.min_gpa || null
  if (userGPAMin !== null && oppMinGPA !== null && userGPAMin >= oppMinGPA) score += 10

  if (userProfile.financial_need) {
    if (opportunity.type === 'grant') score += 5
    if (opportunity.type === 'scholarship') score += 3
  }

  // --- PENALTY ---
  if (opportunity.requires_essay) score -= 5

  return Math.max(0, Math.min(100, Math.round(score)))
}

export function getMatchTier(score) {
  if (score >= 80) return { color: '#3fb950', bg: 'rgba(63,185,80,0.12)', border: 'rgba(63,185,80,0.25)', label: 'Great fit', emoji: '🟢' }
  if (score >= 60) return { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Good match', emoji: '🟡' }
  return { color: '#f85149', bg: 'rgba(248,81,73,0.12)', border: 'rgba(248,81,73,0.2)', label: 'Worth trying', emoji: '🔴' }
}