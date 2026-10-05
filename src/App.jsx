import { useEffect } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import SiteLayout from './components/SiteLayout.jsx'
import Home from './pages/Home.jsx'
import { About, Contact, Pricing, Services } from './pages/MarketingPages.jsx'
import { Login, Register } from './pages/AuthPages.jsx'
import Dashboard from './pages/Dashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import Users from './pages/Users.jsx'
import Profile from './pages/Profile.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'
import ResetPassword from './pages/ResetPassword.jsx'

export default function App() {
  const { pathname } = useLocation()
  useEffect(() => {
    const titles = {
      '/': 'Clarity for what comes next', '/about': 'About', '/services': 'Services',
      '/pricing': 'Pricing', '/contact': 'Contact', '/login': 'Log in',
      '/register': 'Create an account', '/dashboard': 'Dashboard', '/admin': 'Admin console', '/users': 'People', '/profile': 'Profile & settings',
      '/reset-password': 'Reset password', '/auth/callback': 'Completing sign-in',
    }
    document.title = `${titles[pathname] || 'Clarity for what comes next'} | Nexora`
  }, [pathname])

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/users" element={<Users />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/auth/callback" element={<OAuthCallback />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
