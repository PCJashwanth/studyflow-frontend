import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import UsersView from './views/UsersView'
import CoursesView from './views/CoursesView'
import RequestsView from './views/RequestsView'
import AuditLogView from './views/AuditLogView'
import SettingsView from './views/SettingsView'
import ProfileView from './views/ProfileView'


const views = {
  Users: UsersView,
  Courses: CoursesView,
  Requests: RequestsView,
  'Audit log': AuditLogView,
  Settings: SettingsView,
  Profile: ProfileView,
}
const navItems = ['Users', 'Courses', 'Requests', 'Audit log']

function initialsOf(name) {
  return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
}

function AdminDashboard() {
  const { user, logout } = useAuth()
  {/*const { logout } = useAuth() //for testing admin dashboard

  const user = {
    id: 1,
    fullName: 'Test Admin',
    email: 'admin@test.com',
    role: 'ADMIN',
  }
  */}
  const [activePage, setActivePage] = useState('Users')
  const [showPopup, setShowPopup] = useState(false)

  const ActiveView = views[activePage]

  return (
    <div className="dashboard">
      <aside className="sidebar admin">
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
              <button
                className="popup-item"
                onClick={() => { setActivePage('Profile'); setShowPopup(false) }}
              >
                Profile
              </button>
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
              <p className="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-area" onClick={() => setShowPopup(false)}>
        <ActiveView onNavigate={setActivePage} />
      </main>
    </div>
  )
}

export default AdminDashboard
