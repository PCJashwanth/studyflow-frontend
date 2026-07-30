import { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import { api } from '../../../lib/api'

function RequestsView() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/admin/course-requests')
      .then((r) => setRequests(r.data.requests))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load requests'))
      .finally(() => setLoading(false))
  }, [])

  async function decide(id, decision) {
    setError('')
    try {
      const { data } = await api.patch(`/api/admin/course-requests/${id}`, { decision })
      setRequests((list) => list.map((r) => (r.id === id ? data.request : r)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not update request')
    }
  }

  return (
    <>
      <AdminHeader title="Course Requests" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="panel admin-panel">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Requested by</th>
                  <th>Note</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length === 0 ? (
                  <tr><td colSpan="5" className="audit-none">No course requests.</td></tr>
                ) : (
                  requests.map((r) => (
                    <tr key={r.id}>
                      <td><strong>{r.code}</strong> · {r.title}</td>
                      <td>
                        {r.student.fullName}
                        <div style={{ color: '#6b7280', fontSize: 12 }}>{r.student.email}</div>
                      </td>
                      <td>{r.note || '—'}</td>
                      <td><span className={`req-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                      <td>
                        {r.status === 'PENDING' ? (
                          <>
                            <button className="table-action" onClick={() => decide(r.id, 'APPROVED')}>Accept</button>
                            <button className="table-action danger" onClick={() => decide(r.id, 'REJECTED')}>Reject</button>
                          </>
                        ) : (
                          <span className="audit-none">—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default RequestsView
