import { useEffect, useState } from 'react'
import { ArrowLeft, ArrowUpRight, Eye, EyeOff, LockKeyhole, MoveUpRight, ShieldCheck } from 'lucide-react'
import { Link, Navigate, useNavigate, useLocation } from 'react-router-dom'
import Brand from '../components/Brand.jsx'
import { useAuth } from '../auth/AuthProvider.jsx'
import { getAuthenticatedRole, getRoleHomePath, requestPasswordReset, resendSignupConfirmation, signInWithDiscord, signInWithGoogle, signInWithPassword, signOut, signUpWithPassword } from '../auth/authService.js'

export function AuthLayout({ children, title, description, configured }) {
  return (
    <main className="auth-screen">
      <div className="auth-showcase">
        <Brand />
        <Link className="auth-back" to="/"><ArrowLeft size={15} /> Back to Nexora</Link>
        <div className="auth-promo">
          <span className="eyebrow"><span className="eyebrow-dot" /> A clearer way forward</span>
          <h1>Make room<br />for your <span>best work.</span></h1>
          <p>Good things happen when the path ahead feels clear.</p>
          <div className="auth-promo-foot"><span className="auth-promo-mark"><MoveUpRight size={17} /></span><span>NEXORA<br /><small>CLARITY FOR WHAT COMES NEXT</small></span></div>
        </div>
        <span className="auth-showcase-meta">THOUGHTFUL BY DESIGN</span>
      </div>
      <section className="auth-panel">
        <div className="auth-form-wrap">
          <div className="auth-mobile-brand"><Brand /></div>
          <div className="auth-title">
            <span className="eyebrow">{title === 'Welcome back' ? 'Good to see you again' : 'Your next chapter'}</span>
            <h2>{title}</h2>
            <p>{description}</p>
          </div>
          {children}
          <p className="auth-security"><ShieldCheck size={15} />{configured ? 'Authentication secured by Supabase.' : 'Supabase setup is required to sign in.'}</p>
        </div>
      </section>
    </main>
  )
}

function PasswordField({ id, label, value, onChange, autoComplete, hint }) {
  const [visible, setVisible] = useState(false)
  return (
    <label className="field">
      <span>{label}</span>
      <span className="password-wrap">
        <input id={id} name={id} type={visible ? 'text' : 'password'} value={value} onChange={onChange} autoComplete={autoComplete} minLength={8} required />
        <button type="button" className="password-toggle" onClick={() => setVisible(!visible)} aria-label={visible ? 'Hide password' : 'Show password'}>
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </span>
      {hint && <small className="field-hint">{hint}</small>}
    </label>
  )
}

function explainAuthError(error) {
  const message = error?.message?.toLowerCase() || ''
  if (message.includes('invalid login credentials')) return 'Email or password is incorrect. If you have not registered, create a Nexora account first.'
  if (message.includes('email not confirmed')) return 'Confirm your email using the link Supabase sent you, then log in.'
  if (message.includes('already registered') || message.includes('already been registered')) return 'An account may already use this email. Try logging in or request a password reset.'
  return error?.message || 'Authentication could not be completed. Please try again.'
}

export function AuthenticatedRedirect() {
  const navigate = useNavigate()
  const { session, configured } = useAuth()
  const [role, setRole] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getAuthenticatedRole().then(authenticatedRole => {
      if (active) setRole(authenticatedRole)
    }).catch(roleError => {
      if (active) setError(roleError.message || 'Could not verify your account role.')
    })
    return () => { active = false }
  }, [session?.user?.id])

  if (role) return <Navigate to={getRoleHomePath(role)} replace />
  if (error) {
    return (
      <AuthLayout title="Account verification required" description="Nexora could not verify your account role." configured={configured}>
        <p className="form-error" role="alert">{error}</p>
        <button className="button button-outline button-wide" type="button" onClick={async () => { await signOut(); navigate('/login', { replace: true }) }}>Sign out and return to login</button>
      </AuthLayout>
    )
  }
  return <AuthLayout title="Welcome back" description="Verifying your account access…" configured={configured} />
}

function OAuthSignInButton({ provider, configured, busy, setBusy, setError, remember = true, disabled = false }) {
  const buttonConfig = {
    google: {
      label: 'Continue with Google',
      loading: 'Connecting to Google…',
      mark: 'G',
      className: 'google-auth-button',
      markClass: 'google-mark',
      action: () => signInWithGoogle({ remember }),
    },
    discord: {
      label: 'Continue with Discord',
      loading: 'Connecting to Discord…',
      mark: 'D',
      className: 'discord-auth-button',
      markClass: 'discord-mark',
      action: () => signInWithDiscord({ remember }),
    },
  }

  const config = buttonConfig[provider]
  if (!config) return null

  async function continueWithProvider() {
    setError('')
    setBusy(true)
    try {
      await config.action()
    } catch (authError) {
      setError(explainAuthError(authError))
      setBusy(false)
    }
  }

  return (
    <button className={`button button-outline button-wide ${config.className}`} type="button" onClick={continueWithProvider} disabled={!configured || busy || disabled}>
      <span className={config.markClass} aria-hidden="true">{config.mark}</span>{busy ? config.loading : config.label}
    </button>
  )
}

export function Login() {
  const navigate = useNavigate()
  const { session, loading, configured } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  if (loading) return <AuthLayout title="Welcome back" description="Checking your Nexora session." configured={configured} />
  if (session && !busy) return <AuthenticatedRedirect />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!configured) return setError('Supabase is not configured. Check .env.local and restart the dev server.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address to continue.')
    if (password.length < 8) return setError('Your password must be at least 8 characters.')
    setBusy(true)
    try {
      const { role: authenticatedRole } = await signInWithPassword({ email, password, remember })
      navigate(getRoleHomePath(authenticatedRole))
    } catch (authError) {
      const message = explainAuthError(authError).toLowerCase()
      if (message.includes('incorrect') || message.includes('not registered') || message.includes('invalid login credentials')) {
        navigate('/register', {
          replace: true,
          state: { notice: 'Create your account first before logging in.' },
        })
        return
      }
      setError(explainAuthError(authError))
    } finally {
      setBusy(false)
    }
  }

  async function sendResetEmail() {
    setError('')
    setNotice('')
    if (!configured) return setError('Supabase is not configured. Check .env.local and restart the dev server.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter your account email first, then choose Forgot password.')
    setBusy(true)
    try {
      await requestPasswordReset(email)
      setNotice('If an account exists for that email, Supabase will send a password reset link.')
    } catch (authError) {
      setError(explainAuthError(authError))
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Welcome back" description="Log in with the email and password you registered with." configured={configured}>
      <form className="form-stack auth-form" onSubmit={submit} noValidate>
        <OAuthSignInButton provider="google" configured={configured} busy={busy} setBusy={setBusy} setError={setError} remember={remember} />
        <OAuthSignInButton provider="discord" configured={configured} busy={busy} setBusy={setBusy} setError={setError} remember={remember} />
        <div className="auth-divider"><span>or use email</span></div>
        <label className="field"><span>Email address</span><input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" required /></label>
        <PasswordField id="password" label="Password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="current-password" />
        <div className="auth-options">
          <label className="check-label"><input type="checkbox" checked={remember} onChange={event => setRemember(event.target.checked)} /> <span>Remember me</span></label>
          <button className="inline-button" type="button" disabled={busy} onClick={sendResetEmail}>Forgot password?</button>
        </div>
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {!configured && <p className="form-notice" role="status">Add your Supabase URL and publishable key to .env.local, then restart Vite.</p>}
        <button className="button button-primary button-wide" type="submit" disabled={busy || !configured}>{busy ? 'Connecting…' : 'Log in'} <ArrowUpRight size={16} /></button>
      </form>
      <p className="auth-switch">New to Nexora? <Link to="/register">Create an account <ArrowUpRight size={14} /></Link></p>
      <div className="auth-demo-note"><LockKeyhole size={16} /><p><strong>Account required.</strong> Sign in works only for an account registered with Supabase.</p></div>
    </AuthLayout>
  )
}

export function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const { session, loading, configured } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [terms, setTerms] = useState(false)
  const [busy, setBusy] = useState(false)
  const [resendBusy, setResendBusy] = useState(false)
  const [confirmationEmail, setConfirmationEmail] = useState('')
  const [error, setError] = useState(location.state?.notice || '')
  const [notice, setNotice] = useState(location.state?.notice || '')

  if (loading) return <AuthLayout title="Start with Nexora" description="Checking your Nexora session." configured={configured} />
  if (session) return <AuthenticatedRedirect />

  async function submit(event) {
    event.preventDefault()
    setError('')
    setNotice('')
    if (!configured) return setError('Supabase is not configured. Check .env.local and restart the dev server.')
    if (name.trim().length < 2) return setError('Enter your full name to continue.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address to continue.')
    if (password.length < 8) return setError('Use at least 8 characters for your password.')
    if (password !== confirm) return setError('Your passwords don’t match yet.')
    if (!terms) return setError('Please agree to the terms to create your account.')
    setBusy(true)
    try {
      const { session: newSession, role: authenticatedRole } = await signUpWithPassword({ name, email, password })
      if (newSession) navigate(getRoleHomePath(authenticatedRole))
      else {
        setConfirmationEmail(email.trim())
        setNotice('Supabase did not return a session. If email confirmation is enabled, check your inbox and spam folder for a verification link.')
      }
    } catch (authError) {
      setError(explainAuthError(authError))
    } finally {
      setBusy(false)
    }
  }

  async function resendConfirmation() {
    setError('')
    setNotice('')
    setResendBusy(true)
    try {
      await resendSignupConfirmation(confirmationEmail)
      setNotice('If this address has a pending confirmation and email delivery is configured, Supabase will send another link. Check your spam folder too.')
    } catch (resendError) {
      setError(explainAuthError(resendError))
    } finally {
      setResendBusy(false)
    }
  }

  const accountRequiredNotice = location.state?.notice || 'Create your account first before logging in.'

  return (
    <AuthLayout title="Start with Nexora" description="Create your account with your email and password." configured={configured}>
      {accountRequiredNotice && <p className="form-notice" role="status">{accountRequiredNotice}</p>}
      <form className="form-stack auth-form" onSubmit={submit} noValidate>
        <label className="field"><span>Full name</span><input name="name" value={name} onChange={event => setName(event.target.value)} autoComplete="name" placeholder="Alex Morgan" required /></label>
        <label className="field"><span>Email address</span><input type="email" name="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="you@company.com" required /></label>
        <PasswordField id="new-password" label="Password" value={password} onChange={event => setPassword(event.target.value)} autoComplete="new-password" hint="At least 8 characters" />
        <PasswordField id="confirm-password" label="Confirm password" value={confirm} onChange={event => setConfirm(event.target.value)} autoComplete="new-password" />
        <label className="check-label terms-check"><input type="checkbox" checked={terms} onChange={event => setTerms(event.target.checked)} /><span>I agree to Nexora’s <a href="#terms" onClick={event => { event.preventDefault(); setError('Terms and conditions are not configured yet.') }}>terms and conditions</a>.</span></label>
        <div className="auth-divider"><span>or use social sign-in</span></div>
        <OAuthSignInButton provider="google" configured={configured} busy={busy} setBusy={setBusy} setError={setError} disabled={!terms} />
        <OAuthSignInButton provider="discord" configured={configured} busy={busy} setBusy={setBusy} setError={setError} disabled={!terms} />
        {error && <p className="form-error" role="alert">{error}</p>}
        {notice && <p className="form-notice" role="status">{notice}</p>}
        {confirmationEmail && <button className="button button-outline button-wide" type="button" onClick={resendConfirmation} disabled={resendBusy}>{resendBusy ? 'Requesting link…' : 'Resend confirmation email'}</button>}
        {!configured && <p className="form-notice" role="status">Add your Supabase URL and publishable key to .env.local, then restart Vite.</p>}
        <button className="button button-primary button-wide" type="submit" disabled={busy || !configured}>{busy ? 'Creating account…' : 'Create your account'} <ArrowUpRight size={16} /></button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in <ArrowUpRight size={14} /></Link></p>
      <div className="auth-demo-note"><LockKeyhole size={16} /><p><strong>Email not arriving?</strong> Check spam and Supabase Auth email logs. Production delivery to Gmail requires a configured SMTP provider.</p></div>
    </AuthLayout>
  )
}
