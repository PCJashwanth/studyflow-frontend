import { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import { api } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

const ROLE_OPTIONS = ['STUDENT', 'INSTRUCTOR', 'ADMIN']
const COLORS = ['blue', 'purple', 'orange', 'green', 'grey']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function titleCase(role) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function UsersView() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [confirmUser, setConfirmUser] = useState(null)

  useEffect(() => {
    api
      .get('/api/admin/users')
      .then((r) => setUsers(r.data.users))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false))
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

  async function setStatus(u, isActive) {
    setError('')
    try {
      const { data } = await api.patch(`/api/admin/users/${u.id}/status`, { isActive })
      setUsers((list) => list.map((x) => (x.id === u.id ? data.user : x)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not update status')
    }
    setConfirmUser(null)
  }

  const visible = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <AdminHeader title="User Management" />
      <div className="page-body">
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search users..."
            className="user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-user-btn" disabled title="Coming soon">+ Add user</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="panel admin-panel">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
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
                {visible.map((u, i) => {
                  const isSelf = u.id === me.id
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="table-user">
                          <div className={`table-avatar ${COLORS[i % COLORS.length]}`}>
                            {initialsOf(u.fullName)}
                          </div>
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
                        <button className="table-action" disabled title="Coming soon">Edit</button>
                        {u.isActive ? (
                          <button
                            className="table-action danger"
                            disabled={isSelf}
                            onClick={() => setConfirmUser(u)}
                          >
                            Deactivate
                          </button>
                        ) : (
                          <button
                            className="table-action"
                            disabled={isSelf}
                            onClick={() => setStatus(u, true)}
                          >
                            Activate
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {confirmUser && (
        <div className="modal-overlay" onClick={() => setConfirmUser(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Deactivate this account?</h3>
            <p className="modal-text">
              This revokes access for {confirmUser.email}. The action is logged and can be
              reversed from the audit log.
            </p>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setConfirmUser(null)}>Cancel</button>
              <button className="btn-danger" onClick={() => setStatus(confirmUser, false)}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersView
