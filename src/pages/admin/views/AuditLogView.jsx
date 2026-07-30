import { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import { api } from '../../../lib/api'

const COLORS = ['red', 'purple', 'orange', 'green', 'blue']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}
function titleCase(s) {
  return s ? s.charAt(0) + s.slice(1).toLowerCase() : ''
}

function relativeTime(iso) {
  const min = Math.floor((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'just now'
  if (min < 60) return `${min} min ago`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} h ago`
  const day = Math.floor(hr / 24)
  if (day === 1) return 'Yesterday'
  if (day < 7) return `${day} d ago`
  return new Date(iso).toLocaleDateString()
}

// Turn a backend audit action + meta into a readable sentence.
function describe(entry) {
  switch (entry.action) {
    case 'ROLE_CHANGED':
      return `Changed role → ${titleCase(entry.meta?.to)}`
    case 'ACCOUNT_DEACTIVATED':
      return 'Deactivated account'
    case 'ACCOUNT_ACTIVATED':
      return 'Activated account'
    default:
      return entry.action
  }
}

// All current backend actions are user-account changes.
const filters = ['All', 'User changes', 'Course changes', 'Security']

function AuditLogView() {
  const [logs, setLogs] = useState([])
  const [emailById, setEmailById] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [range, setRange] = useState('Last 30 days')

  useEffect(() => {
    Promise.all([api.get('/api/admin/audit-logs'), api.get('/api/admin/users')])
      .then(([l, u]) => {
        setLogs(l.data.auditLogs)
        setEmailById(Object.fromEntries(u.data.users.map((x) => [x.id, x.email])))
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load audit log'))
      .finally(() => setLoading(false))
  }, [])

  // Only "User changes" has real data; other tabs are empty for now.
  const visible = logs.filter(() => activeFilter === 'All' || activeFilter === 'User changes')

  return (
    <>
      <AdminHeader title="Audit Log" />
      <div className="page-body">
        <div className="audit-toolbar">
          <div className="audit-filters">
            {filters.map((f) => (
              <button
                key={f}
                className={`filter-pill ${activeFilter === f ? 'active' : ''}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
          <select className="course-select" value={range} onChange={(e) => setRange(e.target.value)}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        {error && <p className="error-text">{error}</p>}

        <div className="panel admin-panel">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
            <table className="user-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Affected</th>
                </tr>
              </thead>
              <tbody>
                {visible.length === 0 ? (
                  <tr><td colSpan="4" className="audit-none">No entries.</td></tr>
                ) : (
                  visible.map((e, i) => (
                    <tr key={e.id}>
                      <td className="audit-when">{relativeTime(e.createdAt)}</td>
                      <td>
                        <div className="audit-actor">
                          <div className={`table-avatar ${COLORS[i % COLORS.length]}`}>
                            {initialsOf(e.actor.fullName)}
                          </div>
                          <span>{e.actor.fullName}</span>
                        </div>
                      </td>
                      <td>{describe(e)}</td>
                      <td className="audit-affected">{emailById[e.targetId] || e.targetId || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export default AuditLogView
