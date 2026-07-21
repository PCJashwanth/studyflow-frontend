import { useState } from 'react'

const navItems = ['Overview', 'Workload', 'Assignments']

function InstructorDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('Overview')
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="dashboard">

      {/* ── Left sidebar ── */}
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

        {/* Profile popup + user row */}
        <div className="sidebar-bottom">
          {showPopup && (
            <div className="profile-popup">
              <button className="popup-item" onClick={() => setShowPopup(false)}>Profile</button>
              <button className="popup-item" onClick={() => setShowPopup(false)}>Settings</button>
              <hr className="popup-divider" />
              <button className="popup-item danger" onClick={onLogout}>Sign out</button>
            </div>
          )}

          <div className="sidebar-user" onClick={() => setShowPopup(!showPopup)}>
            <div className="user-avatar">DO</div>
            <div>
              <p className="user-name">Dr. D. Okafor</p>
              <p className="user-role">Instructor</p>
            </div>
          </div>
        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="main-area" onClick={() => setShowPopup(false)}>

        <p className="greeting">Good evening, Dr. Okafor</p>
        <p className="greeting-sub">CSCI 2110 — Workload Insights</p>

        {/* Stat cards — placeholder values */}
        <div className="stats-row">
          <div className="stat-card orange-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">Est. study hours allocated</span>
          </div>
          <div className="stat-card blue-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">Avg completion before deadline</span>
          </div>
          <div className="stat-card green-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">Students tracking this course</span>
          </div>
        </div>

        {/* Two-column section */}
        <div className="content-grid">

          {/* Bar chart placeholder */}
          <div className="panel">
            <h2 className="panel-title">Estimated hours by assignment</h2>
            <div className="chart-placeholder">
              <p className="placeholder-msg">Chart will appear here once data is available.</p>
            </div>
          </div>

          {/* Heatmap placeholder */}
          <div className="panel">
            <h2 className="panel-title">When students study (day × time)</h2>
            <div className="chart-placeholder">
              <p className="placeholder-msg">Heatmap will appear here once data is available.</p>
            </div>
          </div>

        </div>
      </main>

    </div>
  )
}

export default InstructorDashboard
