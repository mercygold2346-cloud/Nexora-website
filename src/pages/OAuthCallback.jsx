import { Link, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { AuthLayout, AuthenticatedRedirect } from './AuthPages.jsx'

export default function OAuthCallback() {
  const { session, loading, configured } = useAuth()
  const location = useLocation()
  const query = new URLSearchParams(location.search)
  const hash = new URLSearchParams(location.hash.replace(/^#/, ''))
  const error = query.get('error_description') || query.get('error') || hash.get('error_description') || hash.get('error')

  if (loading) {
    return <AuthLayout title="Welcome back" description="Completing sign-in…" configured={configured} />
  }
  if (session) return <AuthenticatedRedirect />

  return (
    <AuthLayout title="Welcome back" description="Sign-in could not be completed." configured={configured}>
      <p className="form-error" role="alert">{error || 'No authenticated session was returned. Check the OAuth provider and redirect URLs, then try again.'}</p>
      <p className="auth-switch"><Link to="/login">Return to log in</Link></p>
    </AuthLayout>
  )
}
