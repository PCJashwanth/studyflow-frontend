import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { PasswordField } from './AuthLayout'

// "Remember me" just saves the email so it is pre-filled next time.
const REMEMBERED_EMAIL = 'studyflow.rememberedEmail'

const codeInputStyle = { letterSpacing: '0.4em', fontSize: '1.25rem', textAlign: 'center' }

// Login page - steps: credentials → otp, plus a forgot → reset password flow.
function Login() {
  const { login, verifyOtp, forgotPassword, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('credentials') // 'credentials' | 'otp' | 'forgot' | 'reset'
  const [email, setEmail] = useState(() => localStorage.getItem(REMEMBERED_EMAIL) || '')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(() => Boolean(localStorage.getItem(REMEMBERED_EMAIL)))
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function clearMsgs() {
    setError('')
    setNotice('')
  }

  // Step 1: verify credentials → backend emails a code and we switch to the OTP step.
  async function handleCredentials(e) {
    e.preventDefault()
    clearMsgs()
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

  async function handleResend() {
    clearMsgs()
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

  // Forgot step 1: request a reset code for the entered email.
  async function handleForgotRequest(e) {
    e.preventDefault()
    clearMsgs()
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setCode('')
      setNewPassword('')
      setConfirm('')
      setStep('reset')
      setNotice(`If an account exists for ${email}, we emailed a 6-digit reset code. It expires in 5 minutes.`)
    } catch (err) {
      setError(err.response?.data?.error || 'Could not start password reset.')
    } finally {
      setSubmitting(false)
    }
  }

  // Forgot step 2: verify the code and set the new password.
  async function handleReset(e) {
    e.preventDefault()
    setError('')
    if (newPassword !== confirm) return setError('New passwords do not match')
    if (newPassword.length < 8) return setError('New password must be at least 8 characters')
    setSubmitting(true)
    try {
      await resetPassword(email, code, newPassword)
      setPassword('')
      setStep('credentials')
      setNotice('Password reset ✓ — sign in with your new password.')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not reset password. Check the code and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  function goTo(nextStep) {
    setStep(nextStep)
    clearMsgs()
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
      {step === 'credentials' && (
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

              <button type="button" className="btn-link" onClick={() => goTo('forgot')}>
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
      )}

      {step === 'otp' && (
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
                style={codeInputStyle}
              />
            </div>

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={submitting || code.length !== 6}>
              {submitting ? 'Verifying…' : 'Verify & sign in'}
            </button>
          </form>

          <div className="auth-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-link" onClick={() => goTo('credentials')}>
              ← Use a different account
            </button>
            <button type="button" className="btn-link" onClick={handleResend} disabled={submitting}>
              Resend code
            </button>
          </div>
        </>
      )}

      {step === 'forgot' && (
        <>
          <h1>Reset your password</h1>
          <p className="auth-subtitle">Enter your email and we&apos;ll send a 6-digit reset code.</p>

          <form onSubmit={handleForgotRequest}>
            <div className="field">
              <label htmlFor="forgot-email">Email</label>
              <input
                id="forgot-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@dal.ca"
                autoComplete="email"
                autoFocus
                required
              />
            </div>

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Sending code…' : 'Send reset code'}
            </button>
          </form>

          <div className="auth-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-link" onClick={() => goTo('credentials')}>
              ← Back to sign in
            </button>
          </div>
        </>
      )}

      {step === 'reset' && (
        <>
          <h1>Set a new password</h1>
          <p className="auth-subtitle">Enter the code we emailed to {email} and choose a new password.</p>

          <form onSubmit={handleReset}>
            <div className="field">
              <label htmlFor="reset-code">Reset code</label>
              <input
                id="reset-code"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                autoFocus
                required
                style={codeInputStyle}
              />
            </div>

            <PasswordField
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
            <PasswordField
              id="confirm-password"
              label="Confirm new password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />

            {notice && <p className="auth-notice">{notice}</p>}
            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn-primary" disabled={submitting || code.length !== 6}>
              {submitting ? 'Resetting…' : 'Reset password'}
            </button>
          </form>

          <div className="auth-row" style={{ marginTop: '1rem' }}>
            <button type="button" className="btn-link" onClick={() => goTo('forgot')}>
              ← Use a different email
            </button>
            <button type="button" className="btn-link" onClick={handleForgotRequest} disabled={submitting}>
              Resend code
            </button>
          </div>
        </>
      )}
    </AuthLayout>
  )
}

export default Login
