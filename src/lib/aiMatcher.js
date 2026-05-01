export async function rankOpportunitiesWithAI(opportunities, profile) {
  if (!opportunities || opportunities.length === 0) {
    return opportunities
  }

  const prompt = `You are an opportunity matching expert. Rank these opportunities for a student based on how well they match their profile.

Student Profile:
- Grade: ${profile.grade}
- Province: ${profile.province}
- Interests: ${profile.interests?.join(', ') || 'Not specified'}
- GPA: ${profile.gpa || 'Not specified'}
- Financial need: ${profile.financial_need || 'Not specified'}

Opportunities:
${opportunities.map((opp, i) => `
${i + 1}. ${opp.title}
   Organization: ${opp.org_name}
   Type: ${opp.type}
   Description: ${opp.description}
   Interest tags: ${opp.interest_tags?.join(', ') || 'None'}
`).join('\n')}

Return ONLY a JSON array of opportunity IDs in ranked order (best match first). Example: ["id1", "id2", "id3"]

Do not include any other text.`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-20250805',
        max_tokens: 1000,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    })

    if (!response.ok) {
      console.error('Claude API error:', response.status)
      return opportunities
    }

    const data = await response.json()
    const content = data.content[0].text
    const rankedIds = JSON.parse(content)

    const ranked = rankedIds
      .map(id => opportunities.find(opp => opp.id === id))
      .filter(Boolean)

    return ranked.length > 0 ? ranked : opportunities
  } catch (error) {
    console.error('AI ranking error:', error)
    return opportunities
  }
}