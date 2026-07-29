import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout, { PasswordField } from './AuthLayout'

// The three roles a user can sign up as (value is the backend enum).
const ROLES = [
  { label: 'Student', value: 'STUDENT' },
  { label: 'Instructor', value: 'INSTRUCTOR' },
  { label: 'Administrator', value: 'ADMIN' },
]

// Shown live under the password field. Only the length is enforced (that is
// all the backend requires) — the other two are guidance.
function passwordRules(password) {
  return [
    { label: 'At least 8 characters', ok: password.length >= 8 },
    { label: 'One number', ok: /\d/.test(password) },
    { label: 'One symbol', ok: /[^A-Za-z0-9]/.test(password) },
  ]
}

function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [role, setRole] = useState('STUDENT')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signup({ fullName, email, password, role })
      navigate('/') // DashboardRedirect sends them to the right role dashboard
    } catch (err) {
      const data = err.response?.data
      const detail = data?.details && Object.values(data.details)[0]?.[0]
      setError(detail || data?.error || 'Signup failed. Please try again.')
      console.log(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      headline={
        <>
          Join in under
          <br />a minute.
        </>
      }
    >
      <h1>Create your account</h1>
      <p className="auth-subtitle">Choose the role that fits you</p>

      <form onSubmit={handleSubmit}>
        <div className="role-section">
          <span id="role-label">I am a…</span>
          <div className="role-buttons" role="group" aria-labelledby="role-label">
            {ROLES.map((r) => (
              <button
                key={r.value}
                type="button"
                className={`role-btn ${role === r.value ? 'active' : ''}`}
                aria-pressed={role === r.value}
                onClick={() => setRole(r.value)}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label htmlFor="fullName">Full name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Maya Thompson"
            autoComplete="name"
            required
          />
        </div>

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
          autoComplete="new-password"
          minLength={8}
        >
          <ul className="pw-rules">
            {passwordRules(password).map((rule) => (
              <li key={rule.label} className={`pw-rule ${rule.ok ? 'ok' : ''}`}>
                <span className="pw-rule-mark" aria-hidden="true">
                  {rule.ok ? '✓' : '•'}
                </span>
                {rule.label}
              </li>
            ))}
          </ul>
        </PasswordField>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn-primary" disabled={submitting}>
          {submitting ? 'Creating…' : 'Create account'}
        </button>
      </form>

      <p className="auth-alt">
        Already have an account?
        <button onClick={() => navigate('/login')} className="btn-link">
          Sign in
        </button>
      </p>
    </AuthLayout>
  )
}

export default Signup
