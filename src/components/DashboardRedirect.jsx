import { Navigate } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

function DashboardRedirect() {
  const { user } = useAuth()

  if (user.role === 'INSTRUCTOR') {
    return <Navigate to="/instructor" replace />
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/student" replace />
}

export default DashboardRedirect