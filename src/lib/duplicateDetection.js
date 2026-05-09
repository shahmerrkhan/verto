export function findDuplicateOpportunities(opportunities) {
  const seen = new Map()
  const duplicates = []
  
  opportunities.forEach(opp => {
    const key = normalizeName(opp.title) + ':' + (opp.org_name || '')
    
    if (seen.has(key)) {
      duplicates.push({
        original: seen.get(key),
        duplicate: opp,
        similarity: calculateSimilarity(seen.get(key), opp)
      })
    } else {
      seen.set(key, opp)
    }
  })
  
  return duplicates
}

function normalizeName(str) {
  return str.toLowerCase().replace(/[^\w\s]/g, '').trim()
}

function calculateSimilarity(opp1, opp2) {
  // Levenshtein distance-based similarity
  const dist = levenshteinDistance(
    opp1.title.toLowerCase(),
    opp2.title.toLowerCase()
  )
  const maxLen = Math.max(opp1.title.length, opp2.title.length)
  return 1 - (dist / maxLen)
}

function levenshteinDistance(str1, str2) {
  const matrix = []
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        )
      }
    }
  }
  
  return matrix[str2.length][str1.length]
}