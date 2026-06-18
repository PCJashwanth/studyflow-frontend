import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const navItems = ['Dashboard', 'Courses & Tasks', 'Availability', 'Calendar', 'Kanban', 'AI Schedule', 'Reflection']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function weekday(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' })
}

function StudentDashboard() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('Dashboard')
  const [showPopup, setShowPopup] = useState(false)
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
    <div className="dashboard">
      <aside className="sidebar">
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
              <p className="user-role">Student</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area" onClick={() => setShowPopup(false)}>
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
      </main>
    </div>
  )
}

export default StudentDashboard
