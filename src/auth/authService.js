import { isSupabaseConfigured, setRememberSession, supabase } from '../lib/supabaseClient.js'

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Check the URL and publishable key in .env.local, then restart the dev server.')
  }
}

function normalizeRole(role) {
  return String(role || 'member').toLowerCase().replace(/[_\s-]/g, '')
}

export function getAccountRole(user) {
  return normalizeRole(user?.app_metadata?.role)
}

export function getRoleHomePath(role) {
  if (!['member', 'admin', 'superadmin'].includes(role)) {
    throw new Error('The authenticated account has no valid application role.')
  }
  return '/dashboard'
}

export async function getAuthenticatedRole() {
  requireSupabase()
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError
  if (!user) throw new Error('Sign in before loading your account role.')

  const { data: role, error } = await supabase.rpc('current_app_role')
  if (error) throw error
  if (!['member', 'admin', 'superadmin'].includes(role)) {
    throw new Error('Your account role could not be verified. Contact the project administrator.')
  }
  return role
}

export async function signInWithGoogle({ remember = true } = {}) {
  requireSupabase()
  setRememberSession(remember)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
      queryParams: { prompt: 'select_account' },
    },
  })
  if (error) throw error
}

export async function signInWithDiscord({ remember = true } = {}) {
  requireSupabase()
  setRememberSession(remember)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'discord',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
  if (error) throw error
}

export async function signInWithPassword({ email, password, remember }) {
  requireSupabase()
  setRememberSession(remember)
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
  try {
    const role = await getAuthenticatedRole()
    return { ...data, role }
  } catch (roleError) {
    await supabase.auth.signOut()
    throw roleError
  }
}

export async function signUpWithPassword({ name, email, password }) {
  requireSupabase()
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: { full_name: name.trim() },
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  })
  if (error) throw error
  if (data.session) setRememberSession(true)
  const role = data.session ? await getAuthenticatedRole() : null
  return { ...data, role }
}

export async function resendSignupConfirmation(email) {
  requireSupabase()
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email.trim(),
    options: { emailRedirectTo: `${window.location.origin}/dashboard` },
  })
  if (error) throw error
}

export async function requestPasswordReset(email) {
  requireSupabase()
  const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
    redirectTo: `${window.location.origin}/reset-password`,
  })
  if (error) throw error
}

export async function updatePassword(password) {
  requireSupabase()
  const { data, error } = await supabase.auth.updateUser({ password })
  if (error) throw error
  return data.user
}

export async function updateDisplayName(name) {
  requireSupabase()
  const { data, error } = await supabase.auth.updateUser({ data: { full_name: name.trim() } })
  if (error) throw error
  return data.user
}

export async function signOut() {
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
