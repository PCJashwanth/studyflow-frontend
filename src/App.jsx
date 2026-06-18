import { useState } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/Student/StudentDashboard'
import InstructorDashboard from './pages/Instructor/InstructorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import './App.css'

function App() {
  const { user, loading } = useAuth()
  // Only used while logged out, to toggle between login and signup.
  const [authPage, setAuthPage] = useState('login')

  if (loading) return <div className="loading">Loading…</div>

  // Logged out → auth screens.
  if (!user) {
    return authPage === 'signup' ? (
      <Signup onGoToLogin={() => setAuthPage('login')} />
    ) : (
      <Login onGoToSignup={() => setAuthPage('signup')} />
    )
  }

  // Logged in → the dashboard for the user's role.
  if (user.role === 'INSTRUCTOR') return <InstructorDashboard />
  if (user.role === 'ADMIN') return <AdminDashboard />
  return <StudentDashboard />
}

export default App
