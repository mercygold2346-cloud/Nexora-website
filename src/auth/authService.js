import { isSupabaseConfigured, setRememberSession, supabase } from '../lib/supabaseClient.js'

function requireSupabase() {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase is not configured. Check the URL and publishable key in .env.local, then restart the dev server.')
  }
}

export async function signInWithPassword({ email, password, remember }) {
  requireSupabase()
  setRememberSession(remember)
  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw error
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
