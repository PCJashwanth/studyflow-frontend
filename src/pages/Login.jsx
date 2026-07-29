import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { PasswordField } from './AuthLayout'

// "Remember me" just saves the email so it is pre-filled next time.
const REMEMBERED_EMAIL = 'studyflow.rememberedEmail'

// Login page - email/password form, talks to the backend.
function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL) || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL)))
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      await login(email, password)
      if (remember) localStorage.setItem(REMEMBERED_EMAIL, email)
      else localStorage.removeItem(REMEMBERED_EMAIL)
      navigate('/') // DashboardRedirect sends them to the right role dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      headline={
        <>
          Plan smarter,
          <br />
          not harder.
        </>
      }
      tagline="Your courses, tasks, and availability in one place with an AI assistant that builds a study plan you can actually trust."
    >
      <h1>Welcome back</h1>
      <p className="auth-subtitle">Sign in to continue to StudyFlow</p>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@dal.ca"
            autoComplete="email"
            required
          />
        </div>

        <PasswordField
          id="password"
          label="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
        />

        <div className="auth-row">
          <label className="toggle">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            <span className="toggle-track" />
            Remember me
          </label>

          <button
            type="button"
            className="btn-link"
            onClick={() =>
              setNotice('Password reset is not available yet — please contact your administrator.')
            }
          >
            Forgot password?
          </button>
        </div>

        {notice && <p className="auth-notice">{notice}</p>}
        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="auth-alt">
        Don&apos;t have an account?
        <button onClick={() => navigate('/signup')} className="btn-link">
          Create one
        </button>
      </p>
    </AuthLayout>
  )
}

export default Login
