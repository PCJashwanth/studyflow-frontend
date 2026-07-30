import Login from './pages/Login'
import Signup from './pages/Signup'
import StudentDashboard from './pages/Student/StudentDashboard'
import InstructorDashboard from './pages/Instructor/InstructorDashboard'
import AdminDashboard from './pages/admin/AdminDashboard'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import DashboardRedirect from './components/DashboardRedirect'
import './App.css'

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      {/*<Route path="/admin" element={<AdminDashboard />} /> for testing*/}

      <Route path="/" element={
          <ProtectedRoute>
            <DashboardRedirect />
          </ProtectedRoute>
        }
      />

      <Route path="/student" element={
          <ProtectedRoute>
            <RoleRoute role="STUDENT">
              <StudentDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />


      <Route path="/instructor" element={
          <ProtectedRoute>
            <RoleRoute role="INSTRUCTOR">
              <InstructorDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />

      <Route path="/admin" element={
          <ProtectedRoute>
            <RoleRoute role="ADMIN">
              <AdminDashboard />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AppRoutes />
  )
}

export default App
