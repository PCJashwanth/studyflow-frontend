import { useState } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/StudentDashboard'
import InstructorDashboard from './pages/InstructorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import './App.css'

function App() {
  // 'login', 'signup', 'student-dashboard', 'admin-dashboard' or 'instructor-dashboard'
  const [page, setPage] = useState('login')

  return (
    <>
      {page === 'login' && (
        <Login
          onGoToSignup={() => setPage('signup')}
          onLogin={() => setPage('student-dashboard')}
        />
      )}
      {page === 'signup' && (
        <Signup onGoToLogin={() => setPage('login')} />
      )}
      {page === 'student-dashboard' && (
        <StudentDashboard onLogout={() => setPage('login')} />
      )}
      {page === 'instructor-dashboard' && (
        <InstructorDashboard onLogout={() => setPage('login')} />
      )}
      {page === 'admin-dashboard' && (
        <AdminDashboard onLogout={() => setPage('login')} />
      )}
    </>
  )
}

export default App
