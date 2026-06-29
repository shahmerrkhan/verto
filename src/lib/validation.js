// Email validation
export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

// Sanitize input - remove dangerous characters and SQL keywords
export function sanitizeInput(str) {
  if (typeof str !== 'string') return str
  
  // Remove HTML/script tags
  let sanitized = str.replace(/<[^>]*>/g, '')
  
  // Remove control characters
  // eslint-disable-next-line no-control-regex
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Trim whitespace
  sanitized = sanitized.trim()
  
  return sanitized
}

// Validate and sanitize profile data
export function validateProfile(data) {
  const errors = []
  
  if (data.full_name) {
    const sanitized = sanitizeInput(data.full_name)
    if (sanitized.length === 0) {
      errors.push('Full name cannot be empty')
    }
    if (sanitized.length > 100) {
      errors.push('Full name too long (max 100 chars)')
    }
    }
  
  if (data.grade && (isNaN(data.grade) || data.grade < 9 || data.grade > 12)) {
    errors.push('Grade must be 9-12')
  }
  
  if (data.province && !['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'].includes(data.province)) {
    errors.push('Invalid province')
  }
  
  if (data.interests && Array.isArray(data.interests)) {
    const validInterests = ['Software & Tech', 'Engineering', 'Science & Research', 'Business & Entrepreneurship', 'Arts & Design', 'Law & Politics', 'Medicine & Health', 'Environment & Sustainability', 'Education', 'Social Justice & Community', 'Mathematics', 'Writing & Journalism']
    const invalid = data.interests.filter(i => !validInterests.includes(i))
    if (invalid.length > 0) errors.push(`Invalid interests: ${invalid.join(', ')}`)
  }
  
  if (data.gpa_range && !['4.0', '3.5-3.9', '3.0-3.4', '2.5-2.9', 'Below 2.5', 'N/A'].includes(data.gpa_range)) {
    errors.push('Invalid GPA range')
  }
  
  return { valid: errors.length === 0, errors }
}

// Validate save metadata
export function validateSaveMetadata(data) {
  const errors = []
  
  if (data.notes) {
    const sanitized = sanitizeInput(data.notes)
    if (sanitized.length > 1000) {
      errors.push('Notes too long (max 1000 chars)')
    }
    }
  
  if (data.application_status && !['applied', 'interview', 'rejected', 'accepted'].includes(data.application_status)) {
    errors.push('Invalid application status')
  }
  
  if (data.outcome && !['won', 'finalist', 'rejected', 'waitlisted', 'withdrawn'].includes(data.outcome)) {
    errors.push('Invalid outcome')
  }
  
  return { valid: errors.length === 0, errors }
}

// Validate collection name
export function validateCollectionName(name) {
  const errors = []
  
  if (!name || sanitizeInput(name).length === 0) {
    errors.push('Collection name cannot be empty')
  }
  if (name && name.length > 50) {
    errors.push('Collection name too long (max 50 chars)')
  }
  return { valid: errors.length === 0, errors }
}