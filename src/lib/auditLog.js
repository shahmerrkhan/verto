import { supabase } from './supabase'

export async function logAudit(userId, action, entityType, entityId, changes = null) {
  try {
    const { error } = await supabase.from('audit_logs').insert({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      changes,
      created_at: new Date().toISOString(),
    })
    
    if (error) console.error('Audit log failed:', error)
  } catch (err) {
    console.error('Audit log error:', err)
  }
}