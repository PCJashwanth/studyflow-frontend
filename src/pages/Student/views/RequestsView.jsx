import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

function RequestsView() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/courses/requests')
      .then((r) => setRequests(r.data.requests))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load requests'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <PageHeader title="Course Requests" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : requests.length === 0 ? (
          <p className="muted">You haven’t requested any courses yet. Request one from “+ Add course”.</p>
        ) : (
          <div className="panel admin-panel">
            <table className="user-table">
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Instructor</th>
                  <th>Requested</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id}>
                    <td><strong>{r.code}</strong> · {r.title}</td>
                    <td>{r.instructorName || '—'}</td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td><span className={`req-badge ${r.status.toLowerCase()}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}

export default RequestsView
