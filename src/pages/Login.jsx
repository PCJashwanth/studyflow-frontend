import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Login page - shows email/password form
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const navigate = useNavigate()

  function handleSubmit(e) {
    e.preventDefault()
    // TODO: connect to backend login API
    console.log('Login submitted:', { email, password })
    
    // 'student-dashboard', 'admin-dashboard' or 'instructor-dashboard'
    navigate('/admin-dashboard')
  }

  return (
    <div className="page">
      <div className="card">

        {/* App name at the top */}
        <h1 className="logo">Study Flow</h1>

        <h2>Login</h2>

        <form onSubmit={handleSubmit}>

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
            Login
          </button>

        </form>

        {/* Link to switch to the signup page */}
        <p className="switch-text">Not a user?</p>
        <button onClick={() => navigate("/signup")} className="btn-link">
          Sign Up
        </button>

      </div>
    </div>
  )
}

export default Login
