import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

// The three roles a user can sign up as (label -> backend enum is the uppercase).
const ROLES = ['Student', 'Instructor', 'Admin']

function Signup({ onGoToLogin }) {
  const { signup } = useAuth()
  const [role, setRole] = useState('Student')
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
      await signup({
        fullName,
        email,
        password,
        role: role.toUpperCase(), // backend enum is UPPERCASE
      })
      // On success, AuthContext sets the user and App renders the dashboard.
    } catch (err) {
      const data = err.response?.data
      const detail = data?.details && Object.values(data.details)[0]?.[0]
      setError(detail || data?.error || 'Signup failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h1 className="logo">Study Flow</h1>
        <h2>Create account</h2>
        <p className="subtitle">Choose how you will use StudyFlow</p>

        <form onSubmit={handleSubmit}>
          <div className="role-section">
            <label>Role</label>
            <div className="role-buttons">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-btn ${r.toLowerCase()} ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label htmlFor="fullName">Full Name</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
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
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>

          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create Account'}
          </button>
        </form>

        <p className="switch-text">Already a user?</p>
        <button onClick={onGoToLogin} className="btn-link">
          Log In
        </button>
      </div>
    </div>
  )
}

export default Signup
