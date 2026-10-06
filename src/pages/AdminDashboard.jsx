import { useEffect, useState } from 'react'
import { ArrowUpRight, BadgeCheck, CircleHelp, Database, LayoutDashboard, LogOut, Mail, Menu, Settings2, ShieldCheck, UserPlus, UsersRound, X } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getAuthenticatedRole, signOut } from '../auth/authService.js'
import { inviteMember } from '../lib/adminService.js'

function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export default function AdminDashboard() {
  const { session, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const [error, setError] = useState('')
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [roleError, setRoleError] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteBusy, setInviteBusy] = useState(false)
  const [inviteError, setInviteError] = useState('')
  const [inviteNotice, setInviteNotice] = useState('')

  useEffect(() => {
    if (!user) return undefined
    let active = true
    getAuthenticatedRole().then(authenticatedRole => {
      if (active) setRole(authenticatedRole)
    }).catch(roleLookupError => {
      if (active) setRoleError(roleLookupError.message || 'Could not verify your account role.')
    }).finally(() => {
      if (active) setRoleLoading(false)
    })
    return () => { active = false }
  }, [user])

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />
  if (roleLoading) return <main className="auth-panel"><p role="status">Verifying your account role…</p></main>
  if (roleError) return <main className="auth-panel"><p className="form-error" role="alert">{roleError}</p><Link className="button button-outline" to="/dashboard">Back to dashboard</Link></main>
  if (!['admin', 'superadmin'].includes(role)) return <Navigate to="/dashboard" replace />

  const email = user.email || 'Email unavailable'
  const name = user.user_metadata?.full_name || email.split('@')[0]
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
  const roleLabel = role === 'superadmin' ? 'Superadmin' : 'Admin'

  async function logout() {
    setError('')
    try {
      await signOut()
      navigate('/')
    } catch (signOutError) {
      setError(signOutError.message || 'Could not sign out. Please try again.')
    }
  }

  async function submitInvite(event) {
    event.preventDefault()
    setInviteError('')
    setInviteNotice('')
    setInviteBusy(true)
    try {
      const result = await inviteMember({ email: inviteEmail, fullName: inviteName })
      setInviteNotice(`Invitation sent to ${result.email}. New accounts start as members.`)
      setInviteName('')
      setInviteEmail('')
    } catch (inviteFailure) {
      setInviteError(inviteFailure.message || 'Could not send the invitation.')
    } finally {
      setInviteBusy(false)
    }
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar${mobileNav ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand-row"><Brand /><button className="icon-button sidebar-close" aria-label="Close sidebar" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-avatar">N</span><span><strong>Nexora</strong><small>Administration</small></span></div>
        <span className="sidebar-label">OPERATIONS</span>
        <nav className="sidebar-nav" aria-label="Administration navigation">
          <a className="sidebar-link active" href="#overview"><LayoutDashboard size={17} /> Overview</a>
          <Link className="sidebar-link" to="/users"><UsersRound size={17} /> People & access</Link>
          <a className="sidebar-link" href="#workspace"><Database size={17} /> Workspace data</a>
        </nav>
        <span className="sidebar-label sidebar-label-spaced">ACCOUNT</span>
        <nav className="sidebar-nav" aria-label="Account navigation">
          <Link className="sidebar-link" to="/profile"><Settings2 size={17} /> Profile & settings</Link>
          <a className="sidebar-link" href="mailto:hello@nexora.example"><CircleHelp size={17} /> Help & support</a>
        </nav>
        <div className="sidebar-bottom"><button className="sidebar-user" onClick={() => navigate('/profile')}><span className="user-avatar">{initials || 'NX'}</span><span><strong>{name}</strong><small>{email}</small></span></button></div>
      </aside>
      {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar">
          <button className="icon-button dashboard-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button>
          <div className="breadcrumb"><span>Nexora</span><span>/</span><strong>Admin console</strong></div>
          <div className="topbar-actions"><span className="admin-role-badge"><ShieldCheck size={13} />{roleLabel}</span><button className="topbar-profile" onClick={() => navigate('/profile')} aria-label="Open profile settings"><span className="user-avatar">{initials || 'NX'}</span><Settings2 size={15} /></button></div>
        </header>
        <div className="dashboard-content">
          <div className="dashboard-welcome">
            <div><span className="eyebrow">NEXORA ADMINISTRATION</span><h1>Welcome, {name}<span className="greeting-dot">.</span></h1><p>Review account health and workspace setup.</p></div>
            <Link className="button button-primary" to="/profile"><Settings2 size={16} /> Account settings</Link>
          </div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <section className="stat-grid" aria-label="Admin account status">
            <article className="stat-card"><div className="stat-card-top"><span>Access level</span><span className="stat-icon stat-indigo"><ShieldCheck size={17} /></span></div><strong className="account-stat-value">{roleLabel}</strong><div className="stat-foot"><span>Verified Supabase role</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Email status</span><span className={`stat-icon ${user.email_confirmed_at ? 'stat-green' : 'stat-peach'}`}><BadgeCheck size={17} /></span></div><strong className="account-stat-value">{user.email_confirmed_at ? 'Confirmed' : 'Pending'}</strong><div className="stat-foot"><span>{user.email_confirmed_at ? 'Email verified' : 'Confirmation needed'}</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Account created</span><span className="stat-icon stat-peach"><UsersRound size={17} /></span></div><strong className="account-stat-value">{formatDate(user.created_at)}</strong><div className="stat-foot"><span>Supabase Auth record</span></div></article>
          </section>
          <div className="admin-resource-grid">
            <section className="dashboard-panel admin-resource-panel" id="people">
              <div className="panel-heading"><div><span className="eyebrow">DIRECTORY</span><h2>People & access</h2></div><span className="account-empty-icon"><UsersRound size={19} /></span></div>
              <p>Review all registered profiles. Profile-image access remains controlled by the role-based Storage policies.</p>
              <Link className="text-link" to="/users">Open users directory <ArrowUpRight size={15} /></Link>
              <form className="admin-invite-form" onSubmit={submitInvite}>
                <label className="field"><span>Full name</span><input value={inviteName} onChange={event => setInviteName(event.target.value)} autoComplete="name" minLength="2" maxLength="100" required /></label>
                <label className="field"><span>Email address</span><input type="email" value={inviteEmail} onChange={event => setInviteEmail(event.target.value)} autoComplete="email" required /></label>
                {inviteError && <p className="form-error" role="alert">{inviteError}</p>}
                {inviteNotice && <p className="form-notice" role="status">{inviteNotice}</p>}
                <button className="button button-primary button-small" type="submit" disabled={inviteBusy}><UserPlus size={15} />{inviteBusy ? 'Sending invite…' : 'Invite member'}</button>
                <p className="admin-invite-note"><Mail size={13} /> An invitation email is sent. The new account receives the member role.</p>
              </form>
            </section>
            <section className="dashboard-panel admin-resource-panel" id="workspace">
              <div className="panel-heading"><div><span className="eyebrow">WORKSPACE</span><h2>Projects & activity</h2></div><span className="account-empty-icon"><LayoutDashboard size={19} /></span></div>
              <p>Workspace projects and activity will appear here when their data tables and access policies are connected.</p>
              <div className="admin-resource-state"><Database size={15} /><span>Workspace data is not configured</span></div>
            </section>
          </div>
          <section className="dashboard-panel account-security-panel admin-access-panel">
            <span className="account-security-icon"><BadgeCheck size={18} /></span>
            <div><strong>{roleLabel} access verified</strong><p>This session includes the trusted Supabase role claim. Protect future admin data with server-side authorization and database policies.</p></div>
            <button className="panel-link" onClick={logout}><LogOut size={14} /> Sign out</button>
          </section>
          <footer className="dashboard-footer"><span>© {new Date().getFullYear()} Nexora</span><span>Administration console</span><button onClick={logout}><LogOut size={14} /> Log out</button></footer>
        </div>
      </main>
    </div>
  )
}