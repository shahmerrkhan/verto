import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const LIMITS = {
  save: { max: 20, windowMs: 60000 },
  unsave: { max: 20, windowMs: 60000 },
  apply: { max: 10, windowMs: 60000 },
  view: { max: 100, windowMs: 60000 },
  search: { max: 30, windowMs: 60000 },
}

const counts = new Map()

function checkLimit(userId: string, action: string): { allowed: boolean; retryAfter?: number } {
  const limit = LIMITS[action]
  if (!limit) return { allowed: true }

  const key = `${userId}:${action}`
  const now = Date.now()
  const entry = counts.get(key)

  if (!entry || now > entry.resetAt) {
    counts.set(key, { count: 1, resetAt: now + limit.windowMs })
    return { allowed: true }
  }

  if (entry.count >= limit.max) {
    return { allowed: false, retryAfter: entry.resetAt - now }
  }

  entry.count++
  return { allowed: true }
}

serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { action } = await req.json()
    if (!action) {
      return new Response(JSON.stringify({ error: 'Action required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = checkLimit(user.id, action)

    return new Response(JSON.stringify(result), {
      status: result.allowed ? 200 : 429,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})