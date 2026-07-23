//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import InstructorHeader from './InstructorHeader'

// Sample starting values for the notification toggles.
const initialNotifications = [
  { id: 'digest', title: 'Weekly workload digest', sub: 'Sunday summary of class load', on: true },
  { id: 'collision', title: 'Deadline-collision alerts', sub: 'When a deadline hits a peak week', on: true },
  { id: 'lowCompletion', title: 'Low-completion alerts', sub: 'When on-time % drops below 70%', on: false },
  { id: 'newStudent', title: 'New-student tracking', sub: 'When students start tracking the course', on: true },
]

// This is the instructor Settings page. It's a normal item in the sidebar nav.
function SettingsView() {
  // Each toggle's on/off state, e.g. { digest: true, lowCompletion: false, ... }
  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(initialNotifications.map((n) => [n.id, n.on])),
  )
  const [cohortSize, setCohortSize] = useState(10)

  function toggle(id) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <InstructorHeader title="Settings" />
      <div className="page-body">
        {/* Top: Profile + Email notifications side by side */}
        <div className="settings-layout">
          <div className="settings-card">
            <h2 className="settings-card-title">Profile</h2>

            <div className="settings-field">
              <label>Full name</label>
              <input type="text" defaultValue="Dr. David Okafor" />
            </div>
            <div className="settings-field">
              <label>Institutional email</label>
              <input type="email" defaultValue="d.okafor@dal.ca" />
            </div>
            <div className="settings-field">
              <label>Department</label>
              <input type="text" defaultValue="Computer Science" />
            </div>
          </div>

          <div className="settings-card">
            <h2 className="settings-card-title">Email notifications</h2>
            {initialNotifications.map((n) => (
              <div key={n.id} className="notif-row">
                <div className="notif-text">
                  <div className="t">{n.title}</div>
                  <div className="s">{n.sub}</div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={notifications[n.id]} onChange={() => toggle(n.id)} />
                  <span className="slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Analytics & privacy (full width) */}
        <div className="settings-card analytics-card">
          <h2 className="settings-card-title">Analytics &amp; privacy</h2>

          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Anonymized aggregate only</div>
              <div className="s">🔒 Always on — StudyFlow never exposes individual student data to instructors.</div>
            </div>
            <div className="lock-toggle">
              {/* This one is always on and can't be turned off (disabled) */}
              <label className="switch">
                <input type="checkbox" checked disabled readOnly />
                <span className="slider" />
              </label>
              <span className="lock-label">Locked</span>
            </div>
          </div>

          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Minimum cohort size for analytics</div>
              <div className="s">Charts stay hidden until at least this many students are tracking.</div>
            </div>
            <div className="stepper">
              {/* Don't let the minimum drop below 1 student */}
              <button onClick={() => setCohortSize((n) => Math.max(1, n - 1))}>−</button>
              <span>{cohortSize}</span>
              <button onClick={() => setCohortSize((n) => n + 1)}>+</button>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-cta">Save preferences</button>
        </div>
      </div>
    </>
  )
}

export default SettingsView
