import { createContext, useContext, useEffect, useState } from 'react'
import { isSupabaseConfigured, supabase } from '../lib/supabaseClient.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    localStorage.removeItem('nexora.demo.session')
    sessionStorage.removeItem('nexora.demo.session')
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    let authEventReceived = false
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) {
        authEventReceived = true
        setSession(nextSession)
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data, error }) => {
      if (active && !authEventReceived) {
        setSession(error ? null : data.session)
        setLoading(false)
      }
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  return <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, configured: isSupabaseConfigured }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
