import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

// The instructor's Overview page: workload stats + charts.
function OverviewView() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/instructor/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load dashboard'))
  }, [])

  const totalStudents = data?.courses.reduce((sum, c) => sum + c.studentCount, 0) ?? 0
  const assignments = data?.assignmentsByEffort ?? []
  const maxEffort = assignments.reduce((m, a) => Math.max(m, a.totalEffortHours), 0) || 1

  return (
    // page-body adds the padding around the content (main-area has none now)
    <div className="page-body">
      <p className="greeting">Good evening, {user.fullName}</p>
      <p className="greeting-sub">Workload Insights · anonymized aggregate data</p>

      {error && <p className="error-text">{error}</p>}

      <div className="stats-row">
        <div className="stat-card orange-accent">
          <span className="stat-value">{data ? `${data.totalEstimatedHours}h` : '—'}</span>
          <span className="stat-label">Est. study hours allocated</span>
        </div>
        <div className="stat-card blue-accent">
          <span className="stat-value">{data ? `${data.overallCompletionRate}%` : '—'}</span>
          <span className="stat-label">Avg completion rate</span>
        </div>
        <div className="stat-card green-accent">
          <span className="stat-value">{data ? totalStudents : '—'}</span>
          <span className="stat-label">Students tracking courses</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <h2 className="panel-title">Estimated hours by assignment</h2>
          {assignments.length === 0 ? (
            <p className="placeholder-msg">No assignment data yet.</p>
          ) : (
            <ul className="bar-list">
              {assignments.map((a) => (
                <li key={`${a.code}-${a.title}`} className="bar-row">
                  <span className="bar-label">{a.code} · {a.title}</span>
                  <span className="bar-track">
                    <span className="bar-fill" style={{ width: `${(a.totalEffortHours / maxEffort) * 100}%` }} />
                  </span>
                  <span className="bar-value">{a.totalEffortHours}h</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <h2 className="panel-title">When students study (day × time)</h2>
          <div className="chart-placeholder">
            <p className="placeholder-msg">Heatmap appears once scheduling data is available.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewView
