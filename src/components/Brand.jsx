import { Link } from 'react-router-dom'
import { MoveUpRight } from 'lucide-react'

export default function Brand({ footer = false }) {
  return (
    <Link className={`brand${footer ? ' brand-footer' : ''}`} to="/" aria-label="Nexora home">
      <span className="brand-mark" aria-hidden="true"><MoveUpRight size={18} strokeWidth={2.7} /></span>
      <span>Nexora</span>
    </Link>
  )
}
