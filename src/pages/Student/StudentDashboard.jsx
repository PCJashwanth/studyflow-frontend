import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import DashboardView from './views/DashboardView'
import CoursesTasksView from './views/CoursesTasksView'
import AvailabilityView from './views/AvailabilityView'
import CalendarView from './views/CalendarView'
import KanbanView from './views/KanbanView'
import AiScheduleView from './views/AiScheduleView'
import ReflectionView from './views/ReflectionView'
import SettingsView from './views/SettingsView'

// The student area shell: sidebar + profile menu, with the main panel swapping
// between views based on the selected page. Each page name maps to a component.
const views = {
  Dashboard: DashboardView,
  'Courses & Tasks': CoursesTasksView,
  Availability: AvailabilityView,
  Calendar: CalendarView,
  Kanban: KanbanView,
  'AI Schedule': AiScheduleView,
  Reflection: ReflectionView,
  Settings: SettingsView,
}

// These show up in the sidebar. "Settings" is intentionally left out — it opens
// from the profile menu at the bottom-left instead.
const navItems = ['Dashboard', 'Courses & Tasks', 'Availability', 'Calendar', 'Kanban', 'AI Schedule', 'Reflection']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function StudentDashboard() {
  const { user, logout } = useAuth()
  const [activePage, setActivePage] = useState('Dashboard')
  const [showPopup, setShowPopup] = useState(false)

  const ActiveView = views[activePage]

  // Open a page from the profile menu and close the little popup afterwards.
  function goTo(page) {
    setActivePage(page)
    setShowPopup(false)
  }

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
              {/* Settings now lives here in the profile menu */}
              <button className="popup-item" onClick={() => goTo('Settings')}>Settings</button>
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
        <ActiveView />
      </main>
    </div>
  )
}

export default StudentDashboard
