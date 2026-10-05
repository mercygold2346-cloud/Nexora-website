import { ShieldCheck } from 'lucide-react'

function initialsFor(name) {
  return (name || 'Nexora member')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase()
}

export function ProfileImage({ url, name, className = '' }) {
  return (
    <span className={`profile-image ${className}${url ? ' has-image' : ''}`} aria-label={`${name || 'User'} profile image`}>
      {url ? <img src={url} alt="" loading="lazy" referrerPolicy="no-referrer" /> : initialsFor(name)}
    </span>
  )
}

export function RoleBadge({ role }) {
  const labels = { member: 'Member', admin: 'Admin', superadmin: 'Superadmin' }
  const normalizedRole = labels[role] ? role : 'member'
  return <span className={`role-badge role-badge-${normalizedRole}`}>{normalizedRole === 'superadmin' && <ShieldCheck size={12} />}{labels[normalizedRole]}</span>
}
