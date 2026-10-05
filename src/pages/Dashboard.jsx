import { useState } from 'react'
import { ArrowUpRight, CalendarDays, Check, CircleHelp, LayoutDashboard, LogOut, Menu, Settings2, ShieldCheck, UsersRound, X } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getAccountRole, signOut } from '../auth/authService.js'

function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export default function Dashboard() {
  const { session, user, loading, configured } = useAuth()
  const navigate = useNavigate()
  const [mobileNav, setMobileNav] = useState(false)
  const [error, setError] = useState('')

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />
  if (['admin', 'superadmin'].includes(getAccountRole(user))) return <Navigate to="/admin" replace />

  const email = user.email || 'Email unavailable'
  const name = user.user_metadata?.full_name || email.split('@')[0]
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

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
    <div className="app-shell">
      <aside className={`app-sidebar${mobileNav ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand-row"><Brand /><button className="icon-button sidebar-close" aria-label="Close sidebar" onClick={() => setMobileNav(false)}><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-avatar">N</span><span><strong>Nexora</strong><small>Personal workspace</small></span></div>
        <span className="sidebar-label">WORKSPACE</span>
        <nav className="sidebar-nav" aria-label="Workspace navigation"><a className="sidebar-link active" href="#overview"><LayoutDashboard size={17} /> Overview</a><Link className="sidebar-link" to="/users"><UsersRound size={17} /> People</Link><a className="sidebar-link" href="#workspace-data"><ShieldCheck size={17} /> Workspace data</a></nav>
        <span className="sidebar-label sidebar-label-spaced">PERSONAL</span>
        <nav className="sidebar-nav" aria-label="Personal navigation"><Link className="sidebar-link" to="/profile"><Settings2 size={17} /> Profile & settings</Link><a className="sidebar-link" href="mailto:hello@nexora.example"><CircleHelp size={17} /> Help & support</a></nav>
        <div className="sidebar-bottom"><button className="sidebar-user" onClick={() => navigate('/profile')}><span className="user-avatar">{initials || 'NX'}</span><span><strong>{name}</strong><small>{email}</small></span></button></div>
      </aside>
      {mobileNav && <button className="sidebar-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}
      <main className="dashboard-main" id="overview">
        <header className="dashboard-topbar"><button className="icon-button dashboard-menu" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={20} /></button><div className="breadcrumb"><span>Nexora</span><span>/</span><strong>Overview</strong></div><div className="topbar-actions"><button className="topbar-profile" onClick={() => navigate('/profile')} aria-label="Open profile settings"><span className="user-avatar">{initials || 'NX'}</span><Settings2 size={15} /></button></div></header>
        <div className="dashboard-content">
          <div className="dashboard-welcome"><div><span className="eyebrow">YOUR NEXORA ACCOUNT</span><h1>Welcome, {name}<span className="greeting-dot">.</span></h1><p>You’re signed in as {email}.</p></div><Link className="button button-primary" to="/profile"><Settings2 size={16} /> Account settings</Link></div>
          {error && <p className="form-error" role="alert">{error}</p>}
          <section className="stat-grid" aria-label="Account details">
            <article className="stat-card"><div className="stat-card-top"><span>Account status</span><span className="stat-icon stat-green"><Check size={17} /></span></div><strong className="account-stat-value">{user.email_confirmed_at ? 'Confirmed' : 'Pending'}</strong><div className="stat-foot"><span>{user.email_confirmed_at ? 'Email verified' : 'Check your inbox to verify'}</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Member since</span><span className="stat-icon stat-indigo"><CalendarDays size={17} /></span></div><strong className="account-stat-value">{formatDate(user.created_at)}</strong><div className="stat-foot"><span>Supabase account creation date</span></div></article>
            <article className="stat-card"><div className="stat-card-top"><span>Last sign-in</span><span className="stat-icon stat-peach"><ShieldCheck size={17} /></span></div><strong className="account-stat-value">{formatDate(user.last_sign_in_at)}</strong><div className="stat-foot"><span>From your authentication record</span></div></article>
          </section>
          <section className="dashboard-panel account-workspace-panel" id="workspace-data"><div className="panel-heading"><div><span className="eyebrow">YOUR WORKSPACE</span><h2>No workspace records yet</h2></div><span className="account-empty-icon"><LayoutDashboard size={20} /></span></div><p>Supabase email authentication is connected. Project, priority, and activity data will appear here when a database is added. No sample records are being shown.</p><Link className="text-link" to="/profile">Review your profile <ArrowUpRight size={15} /></Link></section>
          <section className="dashboard-panel account-security-panel"><span className="account-security-icon"><ShieldCheck size={18} /></span><div><strong>Your account is authenticated by Supabase</strong><p>Your email and confirmation status come from your Supabase Auth user record.</p></div><button className="panel-link" onClick={logout}><LogOut size={14} /> Sign out</button></section>
          <footer className="dashboard-footer"><span>© {new Date().getFullYear()} Nexora</span><span>Authenticated with Supabase.</span><button onClick={logout}><LogOut size={14} /> Log out</button></footer>
        </div>
      </main>
    </div>
  )
}
