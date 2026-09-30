import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Bell, Check, ChevronRight, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { signOut, updateDisplayName } from '../auth/authService.js'

export default function Profile() {
  const { session, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    if (user) setName(user.user_metadata?.full_name || '')
  }, [user])

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />

  const email = user.email || ''
  const initials = (name || email).split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  async function save(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (name.trim().length < 2) return setError('Enter at least two characters for your name.')
    setBusy(true)
    try {
      await updateDisplayName(name)
      setSaved(true)
      setNotice('Your name was updated in your Supabase account.')
    } catch (updateError) {
      setError(updateError.message || 'Could not update your profile. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  async function logout() {
    setError('')
    try {
      await signOut()
      navigate('/')
    } catch (signOutError) {
      setError(signOutError.message || 'Could not sign out. Please try again.')
    }
  }

  return (
    <div className="settings-app">
      <header className="settings-header"><Brand /><Link to="/dashboard" className="settings-back"><ArrowLeft size={15} /> Back to workspace</Link></header>
      <main className="settings-main">
        <div className="settings-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile & settings</h1><p>Manage the account details stored by Supabase.</p></div>
        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings sections"><a className="settings-nav-item active" href="#profile"><UserRound size={17} /> Personal profile</a><a className="settings-nav-item" href="#notifications"><Bell size={17} /> Notifications</a><a className="settings-nav-item" href="#security"><ShieldCheck size={17} /> Account & security</a></nav>
          <div className="settings-content">
            <form className="settings-section" id="profile" onSubmit={save}>
              <div className="settings-section-heading"><div><h2>Personal profile</h2><p>Your name is saved to your Supabase Auth profile.</p></div><span className="eyebrow">NEXORA</span></div>
              <div className="profile-identity"><span className="profile-avatar">{initials || 'NX'}</span><span><strong>{name || email}</strong><small>{email}</small></span></div>
              <div className="field-row"><label className="field"><span>Full name</span><input value={name} onChange={event => { setName(event.target.value); setSaved(false) }} autoComplete="name" required minLength="2" /></label><label className="field"><span>Email address</span><input type="email" value={email} autoComplete="email" readOnly /><small className="field-hint">Email is managed by Supabase Authentication.</small></label></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {notice && <p className="form-notice" role="status">{notice}</p>}
              <div className="settings-save-row">{saved && <span className="saved-message"><Check size={15} /> Saved</span>}<button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <ArrowUpRight size={15} /></button></div>
            </form>
            <section className="settings-section" id="notifications"><div className="settings-section-heading"><div><h2>Notifications</h2><p>Notification preferences need a database table before they can be saved.</p></div></div><div className="security-row"><span className="setting-toggle-icon"><Bell size={17} /></span><span><strong>No notification preferences saved</strong><small>This account currently stores authentication and profile information only.</small></span></div></section>
            <section className="settings-section" id="security"><div className="settings-section-heading"><div><h2>Account & security</h2><p>Account details from your authenticated Supabase session.</p></div></div><div className="security-row"><span className="security-icon"><ShieldCheck size={18} /></span><span><strong>Email confirmation</strong><small>{user.email_confirmed_at ? `Confirmed ${new Date(user.email_confirmed_at).toLocaleDateString()}` : 'Confirmation is still pending.'}</small></span><span className="security-badge">SUPABASE</span></div><div className="security-row"><span className="security-icon"><UserRound size={18} /></span><span><strong>Account created</strong><small>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Date unavailable'}</small></span></div><button className="signout-row" type="button" onClick={logout}><span className="signout-icon"><LogOut size={17} /></span><span><strong>Log out of Nexora</strong><small>End your Supabase session on this device.</small></span><ChevronRight size={17} /></button></section>
            <p className="settings-disclaimer"><ShieldCheck size={15} /> Authentication and profile details are provided by your Supabase project.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
