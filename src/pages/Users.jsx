import { useEffect, useState } from 'react'
import { ArrowLeft, Search, ShieldCheck } from 'lucide-react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthProvider.jsx'
import { ProfileImage, RoleBadge } from '../components/ProfileImage.jsx'
import Brand from '../components/Brand.jsx'
import { listVisibleProfiles } from '../lib/profileService.js'

export default function Users() {
  const { user, session, loading, configured } = useAuth()
  const [profiles, setProfiles] = useState([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [busy, setBusy] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (user) {
      listVisibleProfiles().then(nextProfiles => {
        if (active) setProfiles(nextProfiles)
      }).catch(loadError => {
        if (active) setError(loadError.message || 'Could not load user profiles.')
      }).finally(() => {
        if (active) setBusy(false)
      })
    }
    return () => { active = false }
  }, [user])

  const normalizedQuery = query.trim().toLowerCase()
  const visibleProfiles = profiles.filter(profile => {
    const matchesQuery = !normalizedQuery || `${profile.full_name || ''} ${profile.role || ''}`.toLowerCase().includes(normalizedQuery)
    const matchesRole = roleFilter === 'all' || profile.role === roleFilter
    return matchesQuery && matchesRole
  })

  if (loading) return <main className="auth-panel"><p role="status">Checking your Nexora session…</p></main>
  if (!configured || !session || !user) return <Navigate to="/login" replace />

  return (
    <div className="settings-app">
      <header className="settings-header"><Brand /><Link to="/dashboard" className="settings-back"><ArrowLeft size={15} /> Back to dashboard</Link></header>
      <main className="settings-main users-main">
        <div className="users-heading">
          <div className="settings-intro"><span className="eyebrow">NEXORA DIRECTORY</span><h1>All Users</h1><p>All registered profiles appear here; image access follows your role.</p></div>
          <div className="users-controls">
            <label className="users-search"><Search size={16} /><span className="visually-hidden">Search users</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search users..." /></label>
            <label className="field users-role-filter">
              <span className="visually-hidden">Filter by role</span>
              <select value={roleFilter} onChange={event => setRoleFilter(event.target.value)} aria-label="Filter users by role">
                <option value="all">All roles</option>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </label>
          </div>
        </div>
        <div className="users-result-summary" aria-live="polite">{busy ? 'Loading profiles…' : `${visibleProfiles.length} ${visibleProfiles.length === 1 ? 'person' : 'people'}`}</div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {!busy && !error && visibleProfiles.length === 0 && <p className="users-empty" role="status">{profiles.length ? 'No profiles match your search or role filter.' : 'No profiles are available yet.'}</p>}
        <section className="users-grid" aria-label="User profiles">
          {visibleProfiles.map(profile => (
            <article className="user-profile-card" key={profile.user_id}>
              <ProfileImage url={profile.avatar_signed_url} name={profile.full_name} className="user-card-avatar" />
              <div className="user-card-copy"><h2>{profile.full_name || 'Nexora member'}</h2><RoleBadge role={profile.role} /><p>Joined {profile.created_at ? new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(profile.created_at)) : 'date unavailable'}</p></div>
              {!profile.avatar_signed_url && <span className="user-image-status"><ShieldCheck size={13} /> Image unavailable</span>}
            </article>
          ))}
        </section>
        <p className="users-security-note"><ShieldCheck size={15} /> Profile images are delivered only when Supabase authorizes your role.</p>
      </main>
    </div>
  )
}
