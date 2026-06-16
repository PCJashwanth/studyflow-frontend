import { useState } from 'react'

// The three roles a user can sign up as
const ROLES = ['Student', 'Instructor', 'Admin']

// Signup page - shows role selection + name/email/password form
function Signup({ onGoToLogin }) {
  const [role, setRole] = useState('Student') // default to Student
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: connect to backend signup API
    console.log('Signup submitted:', { role, fullName, email, password })
  }

  return (
    <div className="page">
      <div className="card">

        {/* App name at the top */}
        <h1 className="logo">Study Flow</h1>

        <h2>Create account</h2>
        <p className="subtitle">Choose how you will use StudyFlow</p>

        <form onSubmit={handleSubmit}>

          {/* Role selection - clicking a button sets the active role */}
          <div className="role-section">
            <label>Role</label>
            <div className="role-buttons">
              {ROLES.map((r) => (
                <button
                  key={r}
                  type="button" /* type=button so it doesn't submit the form */
                  className={`role-btn ${r.toLowerCase()} ${role === r ? 'active' : ''}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Full name field */}
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

          {/* Email field */}
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

          {/* Password field */}
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Orange submit button */}
          <button type="submit" className="btn-primary">
            Create Account
          </button>

        </form>

        {/* Link to go back to the login page */}
        <p className="switch-text">Already a user?</p>
        <button onClick={onGoToLogin} className="btn-link">
          Log In
        </button>

      </div>
    </div>
  )
}

export default Signup
