// Export user data for backup
export async function exportUserData(userId, supabase) {
  try {
    const [profileRes, savesRes, appsRes, metaRes, collectionsRes] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId),
      supabase.from('saves').select('*').eq('user_id', userId),
      supabase.from('applications').select('*').eq('user_id', userId),
      supabase.from('save_metadata').select('*').eq('user_id', userId),
      supabase.from('collections').select('*').eq('user_id', userId),
    ])
    
    const backup = {
      exportedAt: new Date().toISOString(),
      userId,
      profile: profileRes.data,
      saves: savesRes.data,
      applications: appsRes.data,
      metadata: metaRes.data,
      collections: collectionsRes.data,
    }
    
    // Download as JSON file
    const json = JSON.stringify(backup, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `verto-backup-${userId}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    return backup
  } catch (err) {
    console.error('Backup export failed:', err)
    throw err
  }
}