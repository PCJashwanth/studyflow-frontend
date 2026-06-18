import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

const navItems = ['Overview', 'Workload', 'Assignments']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function InstructorDashboard() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('Overview')
  const [showPopup, setShowPopup] = useState(false)
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
    <div className="dashboard">
      <aside className="sidebar instructor">
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
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area" onClick={() => setShowPopup(false)}>
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
      </main>
    </div>
  )
}

export default InstructorDashboard
