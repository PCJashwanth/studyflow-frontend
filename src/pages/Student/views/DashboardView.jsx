import { useState, useEffect } from 'react'
import { api } from '../../../lib/api'
import { useAuth } from '../../../context/AuthContext'

function weekday(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

// The student home/overview page (greeting, stats, today's plan, deadlines).
function DashboardView() {
  const { user } = useAuth()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/student/dashboard')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load dashboard'))
  }, [])

  const firstName = user.fullName.split(' ')[0]
  const completion =
    data && data.counts.tasks
      ? Math.round((data.counts.byStatus.COMPLETE / data.counts.tasks) * 100)
      : 0
  const upcoming = data?.upcomingThisWeek ?? []

  return (
    // page-body adds the padding around the content (the main area itself has none now)
    <div className="page-body">
      <p className="greeting">Good evening, {firstName}</p>
      <p className="greeting-sub">{upcoming.length} deadlines coming up this week</p>

      {error && <p className="error-text">{error}</p>}

      <div className="stats-row">
        <div className="stat-card orange-accent">
          <span className="stat-value">{data ? upcoming.length : '—'}</span>
          <span className="stat-label">Deadlines this week</span>
        </div>
        <div className="stat-card blue-accent">
          <span className="stat-value">{data ? `${data.effortRemainingHours}h` : '—'}</span>
          <span className="stat-label">Effort remaining</span>
        </div>
        <div className="stat-card green-accent">
          <span className="stat-value">{data ? `${completion}%` : '—'}</span>
          <span className="stat-label">On-time completion</span>
        </div>
      </div>

      <div className="content-grid">
        <div className="panel">
          <h2 className="panel-title">Today's plan</h2>
          <p className="placeholder-msg">Generated study blocks will appear here.</p>
        </div>
        <div className="panel">
          <h2 className="panel-title">Upcoming deadlines</h2>
          {upcoming.length === 0 ? (
            <p className="placeholder-msg">No upcoming deadlines.</p>
          ) : (
            <ul className="deadline-list">
              {upcoming.map((t) => (
                <li key={t.id} className="deadline-row">
                  <span className="deadline-day">{weekday(t.deadline)}</span>
                  <span className="deadline-title">{t.title}</span>
                  <span className={`priority-badge ${t.priority.toLowerCase()}`}>{t.priority}</span>
                </li>
              ))}
            </ul>
          )}
          <button className="btn-generate">✦ Generate this week's schedule</button>
        </div>
      </div>
    </div>
  )
}

export default DashboardView
