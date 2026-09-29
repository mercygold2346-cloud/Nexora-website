import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { ArrowUpRight, Menu, X } from 'lucide-react'
import Brand from './Brand.jsx'

const links = [
  ['Home', '/'], ['About', '/about'], ['Services', '/services'], ['Pricing', '/pricing'], ['Contact', '/contact'],
]

export default function SiteLayout() {
  const [menuOpen, setMenuOpen] = useState(false)
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <div className="nav-wrap">
          <Brand />
          <button className="icon-button menu-toggle" aria-label={menuOpen ? 'Close navigation' : 'Open navigation'} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
          <nav className={`main-nav${menuOpen ? ' is-open' : ''}`} aria-label="Main navigation">
            <div className="nav-links">
              {links.map(([label, to]) => <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}>{label}</NavLink>)}
            </div>
            <div className="nav-actions">
              <Link className="nav-login" to="/login" onClick={() => setMenuOpen(false)}>Log in</Link>
              <Link className="button button-primary button-small" to="/register" onClick={() => setMenuOpen(false)}>Get started <ArrowUpRight size={15} /></Link>
            </div>
          </nav>
        </div>
      </header>
      <main id="main-content"><Outlet /></main>
      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand-col">
            <Brand footer />
            <p>Make room for your team’s best work.</p>
            <a className="footer-email" href="mailto:hello@nexora.example">hello@nexora.example</a>
          </div>
          <div className="footer-links-col"><h2>Explore</h2><Link to="/about">About</Link><Link to="/services">Services</Link><Link to="/pricing">Pricing</Link></div>
          <div className="footer-links-col"><h2>Get in touch</h2><Link to="/contact">Contact</Link><Link to="/login">Log in</Link><Link to="/register">Create account</Link></div>
          <div className="footer-note"><span className="eyebrow">A clearer next step</span><p>Good work deserves a better way forward.</p><Link to="/register" aria-label="Get started with Nexora">Start with Nexora <ArrowUpRight size={15} /></Link></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Nexora. All rights reserved.</span><span>Built for the work ahead.</span></div>
      </footer>
    </>
  )
}
