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

export function getRoleHomePath(user) {
  return ['admin', 'superadmin'].includes(getAccountRole(user)) ? '/admin' : '/dashboard'
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

export async function signInWithPassword({ email, password, remember, role = 'member' }) {
  requireSupabase()
  const expectedRole = normalizeRole(role)
  if (!['member', 'admin', 'superadmin'].includes(expectedRole)) {
    throw new Error('Choose a valid account type to sign in.')
  }
  setRememberSession(remember)
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
  const accountRole = getAccountRole(data.user)
  if (accountRole !== expectedRole) {
    await supabase.auth.signOut()
    throw new Error(`This account signed in, but Supabase app_metadata.role must be "${expectedRole}" for this selection. Ask the project administrator to assign that role, then try again.`)
  }
  return data
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
  return data
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
