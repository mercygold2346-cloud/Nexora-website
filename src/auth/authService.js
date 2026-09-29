const SESSION_KEY = 'nexora.demo.session'

// Frontend demo only. Replace this module with a trusted provider before production.
export function signIn({ name, email, remember = false }) {
  const session = { name: name || email.split('@')[0], email, signedInAt: new Date().toISOString() }
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
  ;(remember ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function signOut() {
  localStorage.removeItem(SESSION_KEY)
  sessionStorage.removeItem(SESSION_KEY)
}

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY) || 'null')
  } catch {
    return null
  }
}
