import { useState } from 'react'
import AdminHeader from './AdminHeader'

const ROLE_OPTIONS = ['STUDENT', 'INSTRUCTOR', 'ADMIN']

// Sample users (no backend yet). `color` just picks the avatar colour.
const sampleUsers = [
  { id: 1, fullName: 'Maya Thompson', email: 'maya.t@dal.ca', role: 'STUDENT', isActive: true, color: 'blue' },
  { id: 2, fullName: 'Dr. D. Okafor', email: 'd.okafor@dal.ca', role: 'INSTRUCTOR', isActive: true, color: 'purple' },
  { id: 3, fullName: 'Ragen Running', email: 'ragen.r@dal.ca', role: 'STUDENT', isActive: true, color: 'orange' },
  { id: 4, fullName: 'J. Doe', email: 'jdoe@dal.ca', role: 'STUDENT', isActive: false, color: 'grey' },
  { id: 5, fullName: 'Sidhant Kumar', email: 's.kumar@dal.ca', role: 'STUDENT', isActive: true, color: 'green' },
]

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function titleCase(role) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

function UsersView() {
  const [users, setUsers] = useState(sampleUsers)
  const [search, setSearch] = useState('')
  // The user waiting for deactivation confirmation. null = modal closed.
  const [confirmUser, setConfirmUser] = useState(null)

  // Change a user's role right in the table (local only for now).
  function changeRole(id, role) {
    setUsers((list) => list.map((u) => (u.id === id ? { ...u, role } : u)))
  }

  // Confirm button inside the modal — flip the user to inactive and close.
  function confirmDeactivate() {
    setUsers((list) => list.map((u) => (u.id === confirmUser.id ? { ...u, isActive: false } : u)))
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
        {/* Search + add button sit above the table */}
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search users..."
            className="user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-user-btn">+ Add user</button>
        </div>

        <div className="panel admin-panel">
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
              {visible.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="table-user">
                      <div className={`table-avatar ${u.color}`}>{initialsOf(u.fullName)}</div>
                      <span>{u.fullName}</span>
                    </div>
                  </td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
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
                    {/* Opens the confirmation modal instead of deactivating right away */}
                    <button className="table-action danger" onClick={() => setConfirmUser(u)}>
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation modal — only rendered when a user is pending deactivation */}
      {confirmUser && (
        <div className="modal-overlay" onClick={() => setConfirmUser(null)}>
          {/* stopPropagation so clicking inside the box doesn't close it */}
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">⚠️</div>
            <h3 className="modal-title">Deactivate this account?</h3>
            <p className="modal-text">
              This revokes access for {confirmUser.email}. The action is logged and can be
              reversed from the audit log.
            </p>
            <div className="modal-actions">
              <button className="btn-outline" onClick={() => setConfirmUser(null)}>Cancel</button>
              <button className="btn-danger" onClick={confirmDeactivate}>Deactivate</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default UsersView
