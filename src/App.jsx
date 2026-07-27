import { useState, lazy, Suspense } from 'react'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import './App.css'

// Client-side optimization #1 (Assignment 3): route-level code splitting.
// Each heavy view is loaded on demand instead of shipping in the main bundle,
// so first paint (the login screen) only downloads what it needs.
const Signup = lazy(() => import('./pages/Signup'))
const StudentDashboard = lazy(() => import('./pages/Student/StudentDashboard'))
const InstructorDashboard = lazy(() => import('./pages/Instructor/InstructorDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function App() {
  const { user, loading } = useAuth()
  // Only used while logged out, to toggle between login and signup.
  const [authPage, setAuthPage] = useState('login')

  if (loading) return <div className="loading">Loading…</div>

  const fallback = <div className="loading">Loading…</div>

  // Logged out → auth screens.
  if (!user) {
    return authPage === 'signup' ? (
      <Suspense fallback={fallback}>
        <Signup onGoToLogin={() => setAuthPage('login')} />
      </Suspense>
    ) : (
      <Login onGoToSignup={() => setAuthPage('signup')} />
    )
  }

  // Logged in → the dashboard for the user's role, loaded on demand.
  return (
    <Suspense fallback={fallback}>
      {user.role === 'INSTRUCTOR' ? (
        <InstructorDashboard />
      ) : user.role === 'ADMIN' ? (
        <AdminDashboard />
      ) : (
        <StudentDashboard />
      )}
    </Suspense>
  )
}

export default App
