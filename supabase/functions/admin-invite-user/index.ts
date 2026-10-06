import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function respond(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async request => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (request.method !== 'POST') return respond(405, { error: 'Method not allowed.' })

  const authorization = request.headers.get('Authorization') || ''
  const token = authorization.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!token) return respond(401, { error: 'Authentication is required.' })

  let body: { email?: unknown; fullName?: unknown }
  try {
    const payload: unknown = await request.json()
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return respond(400, { error: 'Provide a valid invitation request.' })
    }
    body = payload as { email?: unknown; fullName?: unknown }
  } catch {
    return respond(400, { error: 'Provide a valid JSON request.' })
  }

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return respond(400, { error: 'Enter a valid email address.' })
  }
  if (fullName.length < 2 || fullName.length > 100) {
    return respond(400, { error: 'Enter a name between 2 and 100 characters.' })
  }

  const projectUrl = Deno.env.get('SUPABASE_URL')
  const publishableKey = Deno.env.get('SUPABASE_ANON_KEY')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
  if (!projectUrl || !publishableKey || !serviceRoleKey) {
    return respond(500, { error: 'The invite service is not configured.' })
  }

  const caller = createClient(projectUrl, publishableKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data: authData, error: authError } = await caller.auth.getUser(token)
  if (authError || !authData.user) return respond(401, { error: 'Your session could not be verified.' })

  const { data: role, error: roleError } = await caller.rpc('current_app_role')
  if (roleError) return respond(403, { error: 'Your account role could not be verified.' })
  if (role !== 'admin' && role !== 'superadmin') {
    return respond(403, { error: 'Only admins can invite users.' })
  }

  const admin = createClient(projectUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName },
  })
  if (error) return respond(400, { error: error.message })

  return respond(200, { email: data.user.email, message: 'Member invitation sent.' })
})