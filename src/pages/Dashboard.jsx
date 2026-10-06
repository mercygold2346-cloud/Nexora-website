import { useEffect, useState } from 'react'
import { ArrowUpRight, BadgeCheck, CalendarDays, LayoutDashboard, LogOut, Menu, Settings2, ShieldCheck, UserRound, UsersRound, X } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { ProfileImage, RoleBadge } from '../components/ProfileImage.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getAuthenticatedRole, signOut } from '../auth/authService.js'
import { getMyProfile, getProfileRoleCounts } from '../lib/profileService.js'

function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export default function Dashboard() {
  const { session, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const [role, setRole] = useState(null)
  const [roleLoading, setRoleLoading] = useState(true)
  const [roleError, setRoleError] = useState('')
  const [profile, setProfile] = useState(null)
  const [counts, setCounts] = useState(null)
  const [countsError, setCountsError] = useState('')
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    if (!user) return undefined
    let active = true
    setRoleLoading(true)
    getAuthenticatedRole().then(nextRole => {
      if (active) setRole(nextRole)
    }).catch(error => {
      if (active) setRoleError(error.message || 'Could not verify your Nexora role.')
    }).finally(() => {
      if (active) setRoleLoading(false)
    })
    getMyProfile().then(nextProfile => {
      if (active) setProfile(nextProfile)
    }).catch(() => {})
    getProfileRoleCounts().then(nextCounts => {
      if (active) setCounts(nextCounts)
    }).catch(() => {
      if (active) setCountsError('User totals are unavailable. Check that the profile security migration has been applied.')
    })
    return () => { active = false }
  }, [user])

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />
  if (roleLoading) return <main className="auth-panel"><p role="status">Verifying your account role…</p></main>
  if (roleError || !role) return <main className="auth-panel"><p className="form-error" role="alert">{roleError || 'Your account role could not be verified.'}</p></main>

  const email = user.email || 'Email unavailable'
  const name = profile?.full_name || user.user_metadata?.full_name || email.split('@')[0]
  const canOpenAdmin = role === 'admin' || role === 'superadmin'

  async function logout() {
    setActionError('')
    try {
      await signOut()
      navigate('/')
    } catch (signOutError) {
      setActionError(signOutError.message || 'Could not sign out. Please try again.')
    }
  }

  return (
    <div className="app-shell">
      <aside className={`app-sidebar${mobileNav ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand-row"><Brand /><button className="icon-button sidebar-close" aria-label="Close sidebar" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-avatar">N</span><span><strong>Nexora</strong><small>Account workspace</small></span></div>
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation">
          <Link className="sidebar-link active" to="/dashboard" onClick={() => setMobileNav(false)}><LayoutDashboard size={17} /> Dashboard</Link>
          <Link className="sidebar-link" to="/users" onClick={() => setMobileNav(false)}><UsersRound size={17} /> Users</Link>
          {canOpenAdmin && <Link className="sidebar-link" to="/admin" onClick={() => setMobileNav(false)}><ShieldCheck size={17} /> Admin console</Link>}
        </nav>
        <span className="sidebar-label sidebar-label-spaced">PERSONAL</span>
        <nav className="sidebar-nav" aria-label="Personal navigation"><Link className="sidebar-link" to="/profile" onClick={() => setMobileNav(false)}><Settings2 size={17} /> Profile & settings</Link></nav>
        <div className="sidebar-bottom"><button className="sidebar-user" onClick={() => navigate('/profile')}><ProfileImage url={profile?.avatar_signed_url} name={name} className="dashboard-avatar" /><span><strong>{name}</strong><small>{email}</small></span></button></div>
      </aside>
      {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar"><button className="icon-button dashboard-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Nexora</span><span>/</span><strong>Dashboard</strong></div><div className="topbar-actions"><RoleBadge role={role} /><button className="topbar-profile" onClick={() => navigate('/profile')} aria-label="Open profile settings"><ProfileImage url={profile?.avatar_signed_url} name={name} className="dashboard-avatar" /><Settings2 size={15} /></button><button className="icon-button dashboard-logout" onClick={logout} aria-label="Log out"><LogOut size={17} /></button></div></header>
        <div className="dashboard-content">
          <div className="dashboard-welcome"><div><span className="eyebrow">NEXORA WORKSPACE</span><h1>Welcome, {name}<span className="greeting-dot">.</span></h1><p>Your account overview and people directory.</p></div><Link className="button button-primary" to="/users"><UsersRound size={16} /> Browse users</Link></div>
          {actionError && <p className="form-error" role="alert">{actionError}</p>}
          <section className="stat-grid dashboard-role-stats" aria-label="Profile totals">
            <article className="stat-card"><div className="stat-card-top"><span>Total users</span><span className="stat-icon stat-indigo"><UsersRound size={17} /></span></div><strong className="account-stat-value">{counts?.total ?? '—'}</strong><div className="stat-foot"><span>Registered profiles</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Members</span><span className="stat-icon stat-green"><UserRound size={17} /></span></div><strong className="account-stat-value">{counts?.members ?? '—'}</strong><div className="stat-foot"><span>Member accounts</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Admins</span><span className="stat-icon stat-peach"><ShieldCheck size={17} /></span></div><strong className="account-stat-value">{counts?.admins ?? '—'}</strong><div className="stat-foot"><span>Admin accounts</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Superadmins</span><span className="stat-icon stat-indigo"><BadgeCheck size={17} /></span></div><strong className="account-stat-value">{counts?.superadmins ?? '—'}</strong><div className="stat-foot"><span>Superadmin accounts</span></div></article>
          </section>
          {countsError && <p className="form-notice" role="status">{countsError}</p>}
          <div className="dashboard-columns">
            <section className="dashboard-panel dashboard-quick-panel"><div className="panel-heading"><div><span className="eyebrow">QUICK ACCESS</span><h2>Go to</h2></div><span className="account-empty-icon"><ArrowUpRight size={18} /></span></div>
              <Link className="dashboard-quick-link" to="/users"><span className="dashboard-quick-icon"><UsersRound size={17} /></span><span><strong>Users directory</strong><small>Browse member, admin, and superadmin profiles</small></span><ArrowUpRight size={15} /></Link>
              <Link className="dashboard-quick-link" to="/profile"><span className="dashboard-quick-icon"><Settings2 size={17} /></span><span><strong>Profile & settings</strong><small>Manage your personal details and profile image</small></span><ArrowUpRight size={15} /></Link>
              {canOpenAdmin && <Link className="dashboard-quick-link" to="/admin"><span className="dashboard-quick-icon"><ShieldCheck size={17} /></span><span><strong>Admin console</strong><small>Open the existing administration area</small></span><ArrowUpRight size={15} /></Link>}
            </section>
            <section className="dashboard-panel dashboard-account-panel"><div className="panel-heading"><div><span className="eyebrow">ACCOUNT</span><h2>Your account</h2></div><ProfileImage url={profile?.avatar_signed_url} name={name} className="dashboard-account-avatar" /></div>
              <div className="dashboard-account-role"><span>Current role</span><RoleBadge role={role} /></div>
              <div className="dashboard-account-row"><span>Email address</span><strong>{email}</strong></div>
              <div className="dashboard-account-row"><span>Email status</span><strong>{user.email_confirmed_at ? 'Confirmed' : 'Pending confirmation'}</strong></div>
              <div className="dashboard-account-row"><span>Member since</span><strong>{formatDate(user.created_at)}</strong></div>
              <div className="dashboard-account-row"><span>Last sign-in</span><strong>{formatDate(user.last_sign_in_at)}</strong></div>
            </section>
          </div>
          <section className="dashboard-panel account-security-panel"><span className="account-security-icon"><ShieldCheck size={18} /></span><div><strong>Role verified by Supabase</strong><p>Your permissions and directory image access are enforced by the backend.</p></div><Link className="panel-link" to="/users">Open directory <ArrowUpRight size={14} /></Link></section>
          <footer className="dashboard-footer"><span>© {new Date().getFullYear()} Nexora</span><span>Authenticated with Supabase.</span><button onClick={logout}><LogOut size={14} /> Log out</button></footer>
        </div>
      </main>
    </div>
  )
}
