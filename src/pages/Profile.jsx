import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Bell, Check, ChevronRight, LogOut, ShieldCheck, UserRound } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { getSession, signOut, signIn } from '../auth/authService.js'

export default function Profile() {
  const session = getSession()
  const navigate = useNavigate()
  const [name, setName] = useState(session?.name || '')
  const [email, setEmail] = useState(session?.email || '')
  const [saved, setSaved] = useState(false)
  const [updates, setUpdates] = useState(true)
  const [digest, setDigest] = useState(false)
  if (!session) return <Navigate to="/login" replace />
  const initials = name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()

  function save(event) {
    event.preventDefault()
    signIn({ name: name.trim(), email: email.trim(), remember: true })
    setSaved(true)
  }
  function logout() { signOut(); navigate('/') }
  return <div className="settings-app"><header className="settings-header"><Brand /><Link to="/dashboard" className="settings-back"><ArrowLeft size={15} /> Back to workspace</Link></header><main className="settings-main"><div className="settings-intro"><span className="eyebrow">YOUR ACCOUNT</span><h1>Profile & settings</h1><p>Make your Nexora workspace feel like yours.</p></div><div className="settings-layout"><nav className="settings-nav" aria-label="Settings sections"><a className="settings-nav-item active" href="#profile"><UserRound size={17} /> Personal profile</a><a className="settings-nav-item" href="#notifications"><Bell size={17} /> Notifications</a><a className="settings-nav-item" href="#security"><ShieldCheck size={17} /> Account & security</a></nav><div className="settings-content"><form className="settings-section" id="profile" onSubmit={save}><div className="settings-section-heading"><div><h2>Personal profile</h2><p>Your details and how you appear in the workspace.</p></div><span className="eyebrow">NEXORA</span></div><div className="profile-identity"><span className="profile-avatar">{initials || 'NX'}</span><span><strong>{name}</strong><small>{email}</small></span></div><div className="field-row"><label className="field"><span>Full name</span><input value={name} onChange={event => { setName(event.target.value); setSaved(false) }} autoComplete="name" required minLength="2" /></label><label className="field"><span>Email address</span><input type="email" value={email} onChange={event => { setEmail(event.target.value); setSaved(false) }} autoComplete="email" required /></label></div><div className="settings-save-row">{saved && <span className="saved-message" role="status"><Check size={15} /> Changes saved</span>}<button className="button button-primary button-small" type="submit">Save changes <ArrowUpRight size={15} /></button></div></form>
      <section className="settings-section" id="notifications"><div className="settings-section-heading"><div><h2>Notifications</h2><p>Choose what you hear about from Nexora.</p></div></div><label className="setting-toggle-row"><span className="setting-toggle-icon"><Bell size={17} /></span><span><strong>Workspace updates</strong><small>Mentions, assignments, and team updates</small></span><input className="toggle-input" type="checkbox" checked={updates} onChange={event => setUpdates(event.target.checked)} aria-label="Workspace updates" /></label><label className="setting-toggle-row"><span className="setting-toggle-icon"><Check size={17} /></span><span><strong>Weekly reflection</strong><small>A short summary of your week on Fridays</small></span><input className="toggle-input" type="checkbox" checked={digest} onChange={event => setDigest(event.target.checked)} aria-label="Weekly reflection" /></label></section>
      <section className="settings-section" id="security"><div className="settings-section-heading"><div><h2>Account & security</h2><p>Manage how you access your Nexora account.</p></div></div><div className="security-row"><span className="security-icon"><ShieldCheck size={18} /></span><span><strong>Password</strong><small>Password management is not connected in this demo.</small></span><span className="security-badge">DEMO ONLY</span></div><button className="signout-row" onClick={logout}><span className="signout-icon"><LogOut size={17} /></span><span><strong>Log out of Nexora</strong><small>End this browser demo session.</small></span><ChevronRight size={17} /></button></section><p className="settings-disclaimer"><ShieldCheck size={15} /> Demo account data is stored in this browser only. Add a trusted identity provider before production use.</p></div></div></main></div>
}
