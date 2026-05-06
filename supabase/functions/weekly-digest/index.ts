import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!

function calculateMatchScore(opportunity: any, profile: any): number {
  let score = 0
  const userInterests = (profile.interests || []).map((i: string) => i.toLowerCase())
  const oppTags = (opportunity.interest_tags || []).map((t: string) => t.toLowerCase())
  const overlap = userInterests.filter((i: string) => oppTags.includes(i)).length
  score += overlap * 20

  const gradeScope = opportunity.grade_scope || []
  if (gradeScope.length === 0 || gradeScope.includes(profile.grade)) score += 20

  const provScope = opportunity.province_scope || []
  if (provScope.length === 0 || provScope.includes('Canada') || provScope.includes(profile.province)) score += 20

  return score
}

function buildEmailHtml(profile: any, opportunities: any[]): string {
  const firstName = (profile.full_name || 'there').split(' ')[0]
  const oppRows = opportunities.map(opp => {
    const deadline = opp.deadline
      ? new Date(opp.deadline).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })
      : 'No deadline'
    const amount = opp.amount ? `$${opp.amount.toLocaleString()}` : ''
    return `
      <div style="background:#161b22;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <span style="font-size:11px;font-weight:700;color:#7d8590;text-transform:uppercase;letter-spacing:0.6px;">${opp.org_name || ''}</span>
          ${amount ? `<span style="font-size:13px;font-weight:800;color:#3fb950;">${amount}</span>` : ''}
        </div>
        <h3 style="font-size:16px;font-weight:700;color:#e6edf3;margin:0 0 8px;">${opp.title}</h3>
        <p style="font-size:13px;color:#7d8590;margin:0 0 14px;line-height:1.5;">${(opp.description || '').slice(0, 120)}${(opp.description || '').length > 120 ? '...' : ''}</p>
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <span style="font-size:12px;color:#f59e0b;font-weight:600;">⏰ Closes ${deadline}</span>
          <a href="https://verto-indol.vercel.app/opportunities/${opp.id}" style="background:#f59e0b;color:#0d1117;padding:8px 16px;border-radius:8px;font-size:12px;font-weight:700;text-decoration:none;">View →</a>
        </div>
      </div>
    `
  }).join('')

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
    <body style="margin:0;padding:0;background:#0d1117;font-family:'DM Sans',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:40px 24px;">

        <div style="text-align:center;margin-bottom:32px;">
          <div style="display:inline-flex;align-items:center;gap:10px;margin-bottom:16px;">
            <svg width="28" height="28" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg">
              <rect width="80" height="80" rx="16" fill="#064e3b"/>
              <polygon points="40,12 64,68 52,68 40,40 28,68 16,68" fill="#34d399"/>
            </svg>
            <span style="font-size:20px;font-weight:800;color:#e6edf3;letter-spacing:-0.5px;">verto</span>
          </div>
          <h1 style="font-size:22px;font-weight:800;color:#e6edf3;margin:0 0 8px;">Your weekly matches, ${firstName}</h1>
          <p style="font-size:14px;color:#7d8590;margin:0;">${opportunities.length} new opportunities matched to your profile this week</p>
        </div>

        ${oppRows}

        <div style="text-align:center;margin-top:32px;padding:24px;background:#161b22;border-radius:12px;border:1px solid rgba(255,255,255,0.06);">
          <p style="font-size:14px;color:#e6edf3;font-weight:700;margin:0 0 8px;">See all your matches</p>
          <p style="font-size:13px;color:#7d8590;margin:0 0 16px;">Your full dashboard has everything matched to your grade, province, and interests.</p>
          <a href="https://verto-indol.vercel.app/dashboard" style="background:#f59e0b;color:#0d1117;padding:12px 28px;border-radius:10px;font-size:14px;font-weight:700;text-decoration:none;display:inline-block;">Go to my dashboard →</a>
        </div>

        <p style="font-size:11px;color:#484f58;text-align:center;margin-top:24px;">
          You're receiving this because you have email alerts on in Verto.<br>
          <a href="https://verto-indol.vercel.app/profile" style="color:#484f58;">Manage preferences</a>
        </p>
      </div>
    </body>
    </html>
  `
}

Deno.serve(async (req) => {
  // Allow cron-job.org to hit this with a GET or POST
  try {
    const now = new Date()
    const sevenDaysOut = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()

    // Fetch all users who have email_alerts on
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email_alerts', true)

    if (profileError) throw profileError
    if (!profiles || profiles.length === 0) {
      return new Response(JSON.stringify({ sent: 0, message: 'No users with alerts on' }), { status: 200 })
    }

    // Fetch active opportunities closing in the next 7 days
    const { data: opportunities, error: oppError } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_active', true)
      .gte('deadline', now.toISOString())
      .lte('deadline', sevenDaysOut)

    if (oppError) throw oppError

    // Also fetch recently added opportunities (no deadline or deadline further out)
    const { data: recentOpps } = await supabase
      .from('opportunities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(50)

    const allOpps = [...(opportunities || []), ...(recentOpps || [])]
    // Deduplicate
    const seen = new Set()
    const dedupedOpps = allOpps.filter(o => {
      if (seen.has(o.id)) return false
      seen.add(o.id)
      return true
    })

    let sentCount = 0

    for (const profile of profiles) {
      // Get user email from auth
      const { data: userData } = await supabase.auth.admin.getUserById(profile.id)
      const email = userData?.user?.email
      if (!email) continue

      // Score and filter opportunities for this user
      const matched = dedupedOpps
        .map(opp => ({ ...opp, _score: calculateMatchScore(opp, profile) }))
        .filter(opp => opp._score >= 20)
        .sort((a, b) => {
          // Prioritize closing soon
          if (a.deadline && b.deadline) return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          if (a.deadline) return -1
          if (b.deadline) return 1
          return b._score - a._score
        })
        .slice(0, 5)

      if (matched.length === 0) continue

      const html = buildEmailHtml(profile, matched)

      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'Verto <onboarding@resend.dev>',
          to: email,
          subject: `${matched.length} opportunities matched to you this week`,
          html,
        }),
      })

      if (res.ok) sentCount++
    }

    return new Response(JSON.stringify({ sent: sentCount, total_users: profiles.length }), { status: 200 })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
})