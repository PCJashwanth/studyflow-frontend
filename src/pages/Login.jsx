import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { PasswordField } from './AuthLayout'

// "Remember me" just saves the email so it is pre-filled next time.
const REMEMBERED_EMAIL = 'studyflow.rememberedEmail'

// Login page - two steps: email/password, then the 6-digit code we email.
function Login() {
  const { login, verifyOtp } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp'
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL) || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL)))
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Step 1: verify credentials → backend emails a code and we switch to the OTP step.
  async function handleCredentials(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const res = await login(email, password)
      if (remember) localStorage.setItem(REMEMBERED_EMAIL, email)
      else localStorage.removeItem(REMEMBERED_EMAIL)
      setCode('')
      setStep('otp')
      setNotice(`We emailed a 6-digit code to ${res.email}. It expires in 5 minutes.`)
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Step 2: verify the emailed code → sets token + user, then go to the dashboard.
  async function handleVerify(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await verifyOtp(email, code)
      navigate('/') // DashboardRedirect sends them to the right role dashboard
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Re-run step 1 to email a fresh code.
  async function handleResend() {
    setError('')
    setNotice('')
    setSubmitting(true)
    try {
      const res = await login(email, password)
      setCode('')
      setNotice(`A new code was sent to ${res.email}.`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not resend the code.')
    } finally {
      setSubmitting(false)
    }
  }

  function backToCredentials() {
    setStep('credentials')
    setError('')
    setNotice('')
    setCode('')
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
      {step === 'credentials' ? (
        <>
          <h1>Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue to StudyFlow</p>

          <form onSubmit={handleCredentials}>
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
              {submitting ? 'Sending code…' : 'Continue'}
            </button>
          </form>

          <p className="auth-alt">
            Don&apos;t have an account?
            <button onClick={() => navigate('/signup')} className="btn-link">
              Create one
            </button>
          </p>
        </>
      ) : (
        <>
          <h1>Verify it&apos;s you</h1>
          <p className="auth-subtitle">Enter the 6-digit code we emailed to {email}</p>

          <form onSubmit={handleVerify}>
            <div className="field">
              <label htmlFor="code">Verification code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                required
                style={{ letterSpacing: '0.4em', fontSize: '1.25rem', textAlign: 'center' }}
              />
            </div>

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={submitting || code.length !== 6}>
              {submitting ? 'Verifying…' : 'Verify & sign in'}
            </button>
          </form>

          <div className="auth-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-link" onClick={backToCredentials}>
              ← Use a different account
            </button>
            <button type="button" className="btn-link" onClick={handleResend} disabled={submitting}>
              Resend code
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  )
}

export default Login
