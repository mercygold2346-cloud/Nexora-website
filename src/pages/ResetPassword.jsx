import { useState } from 'react'
import { ArrowUpRight, LockKeyhole } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { AuthLayout } from './AuthPages.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { updatePassword } from '../auth/authService.js'

export default function ResetPassword() {
  const navigate = useNavigate()
  const { session, loading, configured } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (loading) return <AuthLayout title="Reset your password" description="Checking your secure reset link." configured={configured} />
  if (!configured || !session) return <Navigate to="/login" replace />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (password.length < 8) return setError('Use at least 8 characters for your new password.')
    if (password !== confirm) return setError('Your passwords don’t match yet.')
    setBusy(true)
    try {
      await updatePassword(password)
      setNotice('Your password has been updated.')
      navigate('/dashboard')
    } catch (updateError) {
      setError(updateError.message || 'Could not update your password. Request a new reset link.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Reset your password" description="Choose a new password for your Nexora account." configured={configured}>
      <form className="form-stack auth-form" onSubmit={submit}>
        <label className="field"><span>New password</span><input type="password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
        <label className="field"><span>Confirm new password</span><input type="password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" minLength={8} required /></label>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        <button className="button button-primary button-wide" type="submit" disabled={busy}>{busy ? 'Updating…' : 'Update password'} <ArrowUpRight size={16} /></button>
      </form>
      <p className="auth-switch"><LockKeyhole size={14} /> Secure password update through Supabase.</p>
      <p className="auth-switch"><Link to="/login">Back to log in</Link></p>
    </AuthLayout>
  )
}
