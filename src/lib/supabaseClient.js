import { createClient } from '@supabase/supabase-js'

const authStorageKey = 'nexora.supabase.auth'
const rememberStorageKey = 'nexora.supabase.remember'

const authStorage = {
  getItem(key) {
    return localStorage.getItem(key) ?? sessionStorage.getItem(key)
  },
  setItem(key, value) {
    const remember = localStorage.getItem(rememberStorageKey) === 'true'
    const destination = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    destination.setItem(key, value)
    other.removeItem(key)
  },
  removeItem(key) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  },
}

const projectUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

export const isSupabaseConfigured = Boolean(projectUrl && publishableKey)
export const supabase = isSupabaseConfigured
  ? createClient(projectUrl, publishableKey, {
      auth: {
        storage: authStorage,
        storageKey: authStorageKey,
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function setRememberSession(remember) {
  localStorage.setItem(rememberStorageKey, String(remember))
  const session = localStorage.getItem(authStorageKey) ?? sessionStorage.getItem(authStorageKey)
  if (session) {
    const destination = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    destination.setItem(authStorageKey, session)
    other.removeItem(authStorageKey)
  }
}
