import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const navItems = ['Users', 'Course', 'Audit log', 'Settings']
const ROLE_OPTIONS = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function titleCase(role) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function AdminDashboard() {
  //const { user, logout } = useAuth()
  const { logout } = useAuth()

  const user = {
    id: 1,
    fullName: 'Test Admin',
    email: 'admin@test.com',
    role: 'ADMIN',
  }
  const [activePage, setActivePage] = useState('Users')
  const [showPopup, setShowPopup] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    api
      .get('/api/admin/users')
      .then((r) => setUsers(r.data.users))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load users'))
  }, [])

  async function changeRole(id, role) {
    setError('')
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role`, { role })
      setUsers((list) => list.map((u) => (u.id === id ? data.user : u)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not change role')
    }
  }

  async function toggleStatus(u) {
    setError('')
    try {
      const { data } = await api.patch(`/api/admin/users/${u.id}/status`, { isActive: !u.isActive })
      setUsers((list) => list.map((x) => (x.id === u.id ? data.user : x)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not update status')
    }
  }

  const visible = users.filter(
  //const visible = (users || []).filter( //for testing admindashboard
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="dashboard">
      <aside className="sidebar admin">
        <div className="sidebar-logo">
          <span>StudyFlow</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item}
              className={`nav-item ${activePage === item ? 'active' : ''}`}
              onClick={() => setActivePage(item)}
            >
              {item}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          {showPopup && (
            <div className="profile-popup">
              <button className="popup-item" onClick={() => setShowPopup(false)}>Profile</button>
              <button className="popup-item" onClick={() => setShowPopup(false)}>Settings</button>
              <hr className="popup-divider" />
              <button className="popup-item danger" onClick={logout}>Sign out</button>
            </div>
          )}

          <div className="sidebar-user" onClick={() => setShowPopup(!showPopup)}>
            <div className="user-avatar">{initialsOf(user.fullName)}</div>
            <div>
              <p className="user-name">{user.fullName}</p>
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area" onClick={() => setShowPopup(false)}>
        <p className="greeting">User Management</p>
        <p className="greeting-sub">Manage users, roles, and account status</p>

        {error && <p className="error-text">{error}</p>}

        <div className="panel admin-panel">
          <div className="admin-toolbar">
            <input
              type="text"
              placeholder="Search users..."
              className="user-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-user-btn">+ Add User</button>
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const isSelf = u.id === user.id
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="table-user">
                        <div className="table-avatar">{initialsOf(u.fullName)}</div>
                        <span>{u.fullName}{isSelf ? ' (you)' : ''}</span>
                      </div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        {ROLE_OPTIONS.map((r) => (
                          <option key={r} value={r}>{titleCase(r)}</option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span className={`status-badge ${u.isActive ? 'active' : 'inactive'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button className="table-action">Edit</button>
                      <button
                        className="table-action danger"
                        disabled={isSelf}
                        onClick={() => toggleStatus(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  )
}

export default AdminDashboard
