import { useState } from 'react'
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, MoveUpRight, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { getSession, signIn } from '../auth/authService.js'

function AuthLayout({ children, title, description }) {
  return <main className="auth-screen"><div className="auth-showcase"><Brand /><Link className="auth-back" to="/"><ArrowLeft size={15} /> Back to Nexora</Link><div className="auth-promo"><span className="eyebrow"><span className="eyebrow-dot" /> A clearer way forward</span><h1>Make room<br />for your <span>best work.</span></h1><p>Good things happen when the path ahead feels clear.</p><div className="auth-promo-foot"><span className="auth-promo-mark"><MoveUpRight size={17} /></span><span>NEXORA<br /><small>CLARITY FOR WHAT COMES NEXT</small></span></div></div><span className="auth-showcase-meta">THOUGHTFUL BY DESIGN</span></div><section className="auth-panel"><div className="auth-form-wrap"><div className="auth-mobile-brand"><Brand /></div><div className="auth-title"><span className="eyebrow">{title === 'Welcome back' ? 'Good to see you again' : 'Your next chapter'}</span><h2>{title}</h2><p>{description}</p></div>{children}<p className="auth-security"><ShieldCheck size={15} /> Demo experience. No real account is created.</p></div></section></main>
}

function PasswordField({ id, label, value, onChange, autoComplete, hint, minLength = 8 }) {
  const [visible, setVisible] = useState(false)
  return <label className="field"><span>{label}</span><span className="password-wrap"><input id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} minLength={minLength} required aria-describedby={hint ? `${id}-hint` : undefined} /><button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>{visible ? <EyeOff size={17} /> : <Eye size={17} />}</button></span>{hint && <small className="field-hint" id={`${id}-hint`}>{hint}</small>}</label>
}

export function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  if (getSession()) return <Navigate to="/dashboard" replace />

  function submit(event) {
    event.preventDefault()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address to continue.')
    if (password.length < 8) return setError('Your password must be at least 8 characters.')
    setError('')
    signIn({ email, remember })
    navigate('/dashboard')
  }
  return <AuthLayout title="Welcome back" description="Log in to pick up right where you left off."><form className="form-stack auth-form" onSubmit={submit} noValidate><label className="field"><span>Email address</span><input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" required /></label><PasswordField id="password" label="Password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" /><div className="auth-options"><label className="check-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /> <span>Remember me</span></label><button className="inline-button" type="button" onClick={() => { setNotice('Password recovery is not connected in this demo. Connect an authentication provider to enable it.'); setError('') }}>Forgot password?</button></div>{error && <p className="form-error" role="alert">{error}</p>}{notice && <p className="form-notice" role="status">{notice}</p>}<button className="button button-primary button-wide" type="submit">Log in <ArrowUpRight size={16} /></button></form><p className="auth-switch">New to Nexora? <Link to="/register">Create an account <ArrowUpRight size={14} /></Link></p><div className="auth-demo-note"><LockKeyhole size={16} /><p><strong>Frontend demo only.</strong> Credentials are not verified or sent to a server. Do not use a real password.</p></div></AuthLayout>
}

export function Register() {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [error, setError] = useState('')
  if (getSession()) return <Navigate to="/dashboard" replace />

  function submit(event) {
    event.preventDefault()
    if (name.trim().length < 2) return setError('Enter your full name to continue.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address to continue.')
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    if (password !== confirm) return setError('Your passwords don’t match yet.')
    if (!terms) return setError('Please agree to the terms to create your demo account.')
    setError('')
    signIn({ name: name.trim(), email, remember: true })
    navigate('/dashboard')
  }
  return <AuthLayout title="Start with Nexora" description="A more thoughtful way to move your work forward."><form className="form-stack auth-form" onSubmit={submit} noValidate><label className="field"><span>Full name</span><input name="name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan" required /></label><label className="field"><span>Email address</span><input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" required /></label><PasswordField id="new-password" label="Password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" hint="At least 8 characters" /><PasswordField id="confirm-password" label="Confirm password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" /><label className="check-label terms-check"><input type="checkbox" checked={terms} onChange={event => setTerms(event.target.checked)} /><span>I agree to Nexora’s <a href="#terms" onClick={event => { event.preventDefault(); setError('Terms and conditions are not configured in this frontend demo.') }}>terms and conditions</a>.</span></label>{error && <p className="form-error" role="alert">{error}</p>}<button className="button button-primary button-wide" type="submit">Create your account <ArrowUpRight size={16} /></button></form><p className="auth-switch">Already have an account? <Link to="/login">Log in <ArrowUpRight size={14} /></Link></p><div className="auth-demo-note"><LockKeyhole size={16} /><p><strong>Frontend demo only.</strong> Account details stay in this browser and are not securely authenticated.</p></div></AuthLayout>
}
