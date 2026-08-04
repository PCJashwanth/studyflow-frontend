import { useState, useEffect, useMemo } from 'react'
import AdminHeader from './AdminHeader'
import { api, cachedGet } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

const ROLE_OPTIONS = ['STUDENT', 'INSTRUCTOR', 'ADMIN']
const COLORS = ['blue', 'purple', 'orange', 'green', 'grey']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function titleCase(role) {
  return role.charAt(0) + role.slice(1).toLowerCase()
}

// Prefers the specific field message from a 400 ("Password must be at least 8
// characters") over the generic "Validation failed".
function fieldError(err) {
  const data = err.response?.data
  if (!data) return ''
  const first = data.details && Object.values(data.details).flat()[0]
  return first || data.error || ''
}

function UsersView() {
  const { user: me } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [confirmUser, setConfirmUser] = useState(null)

  // Add / edit dialogs. `modalError` keeps failures inside the dialog so the
  // admin can correct the field without losing what they typed.
  const [addOpen, setAddOpen] = useState(false)
  const [editUser, setEditUser] = useState(null)
  const [form, setForm] = useState({ fullName: '', email: '', password: '', role: 'STUDENT' })
  const [modalError, setModalError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    // cachedGet: repeat visits to this tab reuse the response instead of
    // refetching. Any write clears the cache, so the list never goes stale.
    cachedGet('/api/admin/users')
      .then((r) => setUsers(r.data.users))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load users'))
      .finally(() => setLoading(false))
  }, [])

  function openAdd() {
    setForm({ fullName: '', email: '', password: '', role: 'STUDENT' })
    setModalError('')
    setAddOpen(true)
  }

  function openEdit(u) {
    setForm({ fullName: u.fullName, email: u.email, password: '', role: u.role })
    setModalError('')
    setEditUser(u)
  }

  async function addUser(e) {
    e.preventDefault()
    setSaving(true)
    setModalError('')
    try {
      const { data } = await api.post('/api/admin/users', {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      setUsers((list) => [data.user, ...list]) // the list is newest-first
      setAddOpen(false)
    } catch (err) {
      setModalError(fieldError(err) || 'Could not create the user')
    } finally {
      setSaving(false)
    }
  }

  async function saveEdit(e) {
    e.preventDefault()
    setSaving(true)
    setModalError('')
    try {
      const { data } = await api.patch(`/api/admin/users/${editUser.id}`, {
        fullName: form.fullName,
        email: form.email,
      })
      setUsers((list) => list.map((u) => (u.id === editUser.id ? data.user : u)))
      setEditUser(null)
    } catch (err) {
      setModalError(fieldError(err) || 'Could not save the changes')
    } finally {
      setSaving(false)
    }
  }

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

  // Memoization: this filter ran on every render — including ones caused by
  // opening a modal or typing in an unrelated field. useMemo recomputes it only
  // when the user list or the search term actually changes.
  const visible = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter(
      (u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
    )
  }, [users, search])

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
          <button className="add-user-btn" onClick={openAdd}>+ Add user</button>
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
                        <button className="table-action" onClick={() => openEdit(u)}>Edit</button>
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

      {addOpen && (
        <div className="modal-overlay" onClick={() => setAddOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={addUser}>
            <div className="modal-icon">👤</div>
            <h3 className="modal-title">Add a user</h3>
            <p className="modal-text">
              The account is usable straight away — there is no password reset flow, so set
              one here and pass it on.
            </p>
            <div className="settings-field">
              <label>Full name</label>
              <input required value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input required type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Password</label>
              <input required type="password" minLength={8} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Role</label>
              <select className="role-select" value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {ROLE_OPTIONS.map((r) => (
                  <option key={r} value={r}>{titleCase(r)}</option>
                ))}
              </select>
            </div>
            {modalError && <p className="error-text">{modalError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setAddOpen(false)}>Cancel</button>
              <button type="submit" className="btn-cta" disabled={saving}>
                {saving ? 'Creating…' : 'Create user'}
              </button>
            </div>
          </form>
        </div>
      )}

      {editUser && (
        <div className="modal-overlay" onClick={() => setEditUser(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveEdit}>
            <div className="modal-icon">✏️</div>
            <h3 className="modal-title">Edit user</h3>
            <p className="modal-text">
              Role and status are changed from the table. Changes here are recorded in the
              audit log.
            </p>
            <div className="settings-field">
              <label>Full name</label>
              <input required value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Email</label>
              <input required type="email" value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            {modalError && <p className="error-text">{modalError}</p>}
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setEditUser(null)}>Cancel</button>
              <button type="submit" className="btn-cta" disabled={saving}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </form>
        </div>
      )}

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
