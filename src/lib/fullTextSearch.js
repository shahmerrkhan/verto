export function searchOpportunities(opportunities, query) {
  if (!query || query.trim().length === 0) return opportunities
  
  const q = query.toLowerCase()
  
  return opportunities.filter(opp => {
    // Search across multiple fields
    const searchable = [
      opp.title || '',
      opp.org_name || '',
      opp.description || '',
      opp.eligibility_notes || '',
      (Array.isArray(opp.interest_tags) ? opp.interest_tags.join(' ') : ''),
      opp.type || '',
      opp.location || '',
    ].join(' ').toLowerCase()
    
    // Split query into terms and require all to match
    const terms = q.split(/\s+/).filter(Boolean)
    return terms.every(term => searchable.includes(term))
  })
}

export function rankSearchResults(opportunities, query) {
  if (!query) return opportunities
  
  const q = query.toLowerCase()
  
  // Score based on match position
  return opportunities.map(opp => {
    let score = 0
    
    // Exact title match = highest score
    if ((opp.title || '').toLowerCase() === q) score += 1000
    // Title starts with query = high score
    if ((opp.title || '').toLowerCase().startsWith(q)) score += 500
    // Title contains query = medium score
    if ((opp.title || '').toLowerCase().includes(q)) score += 250
    
    // Org name match = lower score
    if ((opp.org_name || '').toLowerCase().includes(q)) score += 100
    
    // Description match = lowest score
    if ((opp.description || '').toLowerCase().includes(q)) score += 25
    
    return { ...opp, _searchScore: score }
  }).sort((a, b) => b._searchScore - a._searchScore)
}

export function highlightSearchResults(text, query) {
  if (!query) return text
  const regex = new RegExp(`(${query})`, 'gi')
  return text.replace(regex, '<mark>$1</mark>')
}