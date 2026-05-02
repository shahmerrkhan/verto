export function rankOpportunitiesWithAI(opportunities, profile) {
  if (!opportunities || opportunities.length === 0) {
    return opportunities
  }

  // Score each opportunity based on profile match
  const scored = opportunities.map(opp => {
    let score = 0

    // Interest match (highest weight)
    if (profile.interests && profile.interests.length > 0) {
      const interestTags = opp.interest_tags || []
      const matches = profile.interests.filter(interest =>
        interestTags.some(tag => 
          tag.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(tag.toLowerCase())
        )
      ).length
      score += matches * 25
    }

    // Type preference (students often have a type they prefer)
    if (opp.type === 'scholarship' || opp.type === 'competition') {
      score += 15
    }

    // Financial need match
    if (profile.financial_need && opp.amount > 0) {
      score += 20
    }

    // Deadline urgency (closer deadlines surface higher)
    if (opp.deadline) {
      const today = new Date()
      const deadline = new Date(opp.deadline)
      const daysLeft = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24))
      
      if (daysLeft > 0 && daysLeft <= 7) score += 10
      if (daysLeft > 7 && daysLeft <= 30) score += 5
    }

    // High-value opportunities
    if (opp.amount && opp.amount >= 5000) {
      score += 10
    }

    // No essay required bonus
    if (!opp.requires_essay) {
      score += 8
    }

    // Recently added
    if (opp.created_at) {
      const today = new Date()
      const created = new Date(opp.created_at)
      const daysOld = Math.ceil((today - created) / (1000 * 60 * 60 * 24))
      if (daysOld <= 7) score += 5
    }

    return { ...opp, _score: score }
  })

  // Sort by score descending, then by deadline (closer first)
  const ranked = scored.sort((a, b) => {
    if (b._score !== a._score) {
      return b._score - a._score
    }
    
    // Tiebreaker: closer deadline wins
    if (a.deadline && b.deadline) {
      return new Date(a.deadline) - new Date(b.deadline)
    }
    return 0
  })

  // Remove the temporary _score field before returning
  return ranked.map(({ _score, ...opp }) => opp)
}