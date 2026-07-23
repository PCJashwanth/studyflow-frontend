import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import OverviewView from './views/OverviewView'
import WorkloadView from './views/WorkloadView'
import AssignmentsView from './views/AssignmentsView'
import SettingsView from './views/SettingsView'

const views = {
  Overview: OverviewView,
  Workload: WorkloadView,
  Assignments: AssignmentsView,
  Settings: SettingsView,
}
const navItems = Object.keys(views)

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function InstructorDashboard() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('Overview')
  const [showPopup, setShowPopup] = useState(false)

  const ActiveView = views[activePage]

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
              <button
                className="popup-item"
                onClick={() => { setActivePage('Settings'); setShowPopup(false) }}
              >
                Settings
              </button>
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
        <ActiveView />
      </main>
    </div>
  )
}

export default InstructorDashboard
