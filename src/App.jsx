import { Suspense, lazy } from 'react'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import RoleRoute from './components/RoleRoute'
import DashboardRedirect from './components/DashboardRedirect'
import './App.css'

// Client-side optimization: lazy loading (code splitting).
// Each dashboard becomes its own chunk, downloaded only when a user of that
// role actually navigates to it. A student never downloads the admin panel.
// Login and Signup stay eagerly loaded — they are the first screen, so
// splitting them would only add a round trip.
const StudentDashboard = lazy(() => import('./pages/Student/StudentDashboard'))
const InstructorDashboard = lazy(() => import('./pages/Instructor/InstructorDashboard'))
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))

function AppRoutes() {
  return (
    // Suspense shows this while the route's chunk is being fetched.
    <Suspense fallback={<p className="muted" style={{ padding: 24 }}>Loading…</p>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

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
    </Suspense>
  )
}

function App() {
  return (
    <AppRoutes />
  )
}

export default App
