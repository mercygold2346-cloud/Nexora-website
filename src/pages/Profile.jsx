import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Bell, Camera, Check, ChevronRight, LogOut, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { ProfileImage, RoleBadge } from '../components/ProfileImage.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getAccountRole, signOut, updateDisplayName } from '../auth/authService.js'
import { deleteMyAvatar, getMyProfile, uploadMyAvatar } from '../lib/profileService.js'

export default function Profile() {
  const { session, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState(user?.user_metadata?.full_name || '')
  const [profile, setProfile] = useState(null)
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const avatarInput = useRef(null)

  useEffect(() => {
    let active = true
    if (user) {
      setName(user.user_metadata?.full_name || '')
      getMyProfile().then(nextProfile => {
        if (active) {
          setProfile(nextProfile)
          setName(nextProfile.full_name || user.user_metadata?.full_name || '')
        }
      }).catch(profileError => {
        if (active) setError(profileError.message || 'Could not load your profile.')
      })
    }
    return () => { active = false }
  }, [user])

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />

  const email = user.email || ''
  const accountRole = getAccountRole(user)
  const profileRole = profile?.role || accountRole
  const displayRole = { member: 'Member', admin: 'Admin', superadmin: 'Superadmin' }[profileRole] || 'Member'
  const returnPath = ['admin', 'superadmin'].includes(accountRole) ? '/admin' : '/dashboard'

  async function changeAvatar(event) {
    const input = event.currentTarget
    const file = input.files?.[0]
    if (!file) return
    setError('')
    setNotice('')
    setAvatarBusy(true)
    try {
      const nextProfile = await uploadMyAvatar(file)
      setProfile(nextProfile)
      setNotice('Your profile image was updated.')
    } catch (uploadError) {
      setError(uploadError.message || 'Could not update your profile image.')
    } finally {
      setAvatarBusy(false)
      input.value = ''
    }
  }

  async function removeAvatar() {
    setError('')
    setNotice('')
    setAvatarBusy(true)
    try {
      const nextProfile = await deleteMyAvatar()
      setProfile(nextProfile)
      setNotice('Your profile image was removed.')
    } catch (deleteError) {
      setError(deleteError.message || 'Could not remove your profile image.')
    } finally {
      setAvatarBusy(false)
    }
  }

  async function save(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (name.trim().length < 2) return setError('Enter at least two characters for your name.')
    setBusy(true)
    try {
      await updateDisplayName(name)
      setProfile(await getMyProfile())
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
      <header className="settings-header"><Brand /><Link to={returnPath} className="settings-back"><ArrowLeft size={15} /> Back to workspace</Link></header>
      <main className="settings-main">
        <div className="settings-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile & settings</h1><p>Manage the account details stored by Supabase.</p></div>
        <div className="settings-layout">
          <nav className="settings-nav" aria-label="Settings sections"><a className="settings-nav-item active" href="#profile"><UserRound size={17} /> Personal profile</a><a className="settings-nav-item" href="#notifications"><Bell size={17} /> Notifications</a><a className="settings-nav-item" href="#security"><ShieldCheck size={17} /> Account & security</a></nav>
          <div className="settings-content">
            <form className="settings-section" id="profile" onSubmit={save}>
              <div className="settings-section-heading"><div><h2>Personal profile</h2><p>Manage your own profile details and image.</p></div><span className="eyebrow">NEXORA</span></div>
              <div className="profile-identity"><ProfileImage url={profile?.avatar_signed_url} name={name || email} className="profile-avatar" /><span><strong>{name || email}</strong><small>{email}</small><RoleBadge role={profileRole} /></span></div>
              <div className="profile-image-controls">
                <div><strong>Profile image</strong><small>JPEG, PNG, or WebP. Maximum 5 MB.</small></div>
                <div className="profile-image-actions">
                  <button className="button button-secondary button-small" type="button" onClick={() => avatarInput.current?.click()} disabled={avatarBusy}><Camera size={15} />{avatarBusy ? 'Updating…' : (profile?.avatar_path ? 'Change image' : 'Upload profile image')}</button>
                  {profile?.avatar_path && <button className="button button-secondary button-small" type="button" onClick={removeAvatar} disabled={avatarBusy}><Trash2 size={15} />Delete image</button>}
                  <input ref={avatarInput} className="visually-hidden" type="file" accept="image/jpeg,image/png,image/webp" onChange={changeAvatar} aria-label="Choose profile image" />
                </div>
              </div>
              <div className="field-row"><label className="field"><span>Full name</span><input value={name} onChange={event => { setName(event.target.value); setSaved(false) }} autoComplete="name" required minLength="2" /></label><label className="field"><span>Email address</span><input type="email" value={email} autoComplete="email" readOnly /><small className="field-hint">Email is managed by Supabase Authentication.</small></label></div>
              <div className="field-row"><label className="field"><span>Current role</span><input value={displayRole} readOnly /></label></div>
              {error && <p className="form-error" role="alert">{error}</p>}
              {notice && <p className="form-notice" role="status">{notice}</p>}
              <div className="settings-save-row">{saved && <span className="saved-message"><Check size={15} /> Saved</span>}<button className="button button-primary button-small" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save changes'} <ArrowUpRight size={15} /></button></div>
            </form>
            <section className="settings-section" id="notifications"><div className="settings-section-heading"><div><h2>Notifications</h2><p>Notification preferences need a database table before they can be saved.</p></div></div><div className="security-row"><span className="setting-toggle-icon"><Bell size={17} /></span><span><strong>No notification preferences saved</strong><small>This account currently stores authentication and profile information only.</small></span></div></section>
            <section className="settings-section" id="security"><div className="settings-section-heading"><div><h2>Account & security</h2><p>Account details from your authenticated Supabase session.</p></div></div><div className="security-row"><span className="security-icon"><ShieldCheck size={18} /></span><span><strong>Application role</strong><small>Assigned by a trusted administrator and not editable here.</small></span><RoleBadge role={accountRole} /></div><div className="security-row"><span className="security-icon"><ShieldCheck size={18} /></span><span><strong>Email confirmation</strong><small>{user.email_confirmed_at ? `Confirmed ${new Date(user.email_confirmed_at).toLocaleDateString()}` : 'Confirmation is still pending.'}</small></span><span className="security-badge">SUPABASE</span></div><div className="security-row"><span className="security-icon"><UserRound size={18} /></span><span><strong>Account created</strong><small>{user.created_at ? new Date(user.created_at).toLocaleDateString() : 'Date unavailable'}</small></span></div><button className="signout-row" type="button" onClick={logout}><span className="signout-icon"><LogOut size={17} /></span><span><strong>Log out of Nexora</strong><small>End your Supabase session on this device.</small></span><ChevronRight size={17} /></button></section>
            <p className="settings-disclaimer"><ShieldCheck size={15} /> Authentication and profile details are provided by your Supabase project.</p>
          </div>
        </div>
      </main>
    </div>
  )
}
