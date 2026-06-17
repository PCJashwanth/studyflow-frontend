import { useState } from 'react'

const navItems = ['Dashboard', 'Courses & Tasks', 'Availability', 'Calendar', 'Kanban', 'AI Schedule', 'Reflection']

function StudentDashboard({ onLogout }) {
  const [activePage, setActivePage] = useState('Dashboard')
  const [showPopup, setShowPopup] = useState(false)

  return (
    <div className="dashboard">

      {/* ── Left sidebar ── */}
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

        {/* Profile section at the bottom */}
        <div className="sidebar-bottom">

          {/* Popup menu — appears above the profile when clicked */}
          {showPopup && (
            <div className="profile-popup">
              <button className="popup-item" onClick={() => setShowPopup(false)}>Profile</button>
              <button className="popup-item" onClick={() => setShowPopup(false)}>Settings</button>
              <hr className="popup-divider" />
              <button className="popup-item danger" onClick={onLogout}>Sign out</button>
            </div>
          )}

          {/* Clicking the user row toggles the popup */}
          <div className="sidebar-user" onClick={() => setShowPopup(!showPopup)}>
            <div className="user-avatar">MT</div>
            <div>
              <p className="user-name">Maya Thompson</p>
              <p className="user-role">Student</p>
            </div>
          </div>

        </div>

      </aside>

      {/* ── Main content ── */}
      <main className="main-area" onClick={() => setShowPopup(false)}>

        <p className="greeting">Good evening, Maya</p>
        <p className="greeting-sub">3 deadlines coming up this week</p>

        <div className="stats-row">
          <div className="stat-card orange-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">Deadlines this week</span>
          </div>
          <div className="stat-card blue-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">Study time planned</span>
          </div>
          <div className="stat-card green-accent">
            <span className="stat-value">—</span>
            <span className="stat-label">On-time completion</span>
          </div>
        </div>

        <div className="content-grid">
          <div className="panel">
            <h2 className="panel-title">Today's plan</h2>
            <p className="placeholder-msg">No tasks scheduled yet.</p>
          </div>
          <div className="panel">
            <h2 className="panel-title">Upcoming deadlines</h2>
            <p className="placeholder-msg">No upcoming deadlines.</p>
            <button className="btn-generate">✦ Generate this week's schedule</button>
          </div>
        </div>

      </main>

    </div>
  )
}

export default StudentDashboard
