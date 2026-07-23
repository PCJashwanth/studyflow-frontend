//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import PageHeader from './PageHeader'

// The email notification toggles. `on` is the starting value for each switch.
const initialNotifications = [
  { id: 'deadline', title: 'Deadline reminders', sub: '24h before each due date', on: true },
  { id: 'blockStart', title: 'Study block start', sub: 'At the start of each block', on: true },
  { id: 'reflection', title: 'Weekly reflection', sub: 'Sunday evening summary', on: true },
  { id: 'digest', title: 'Daily digest', sub: 'Every morning at 8 AM', on: false },
]

const calendarApps = [
  { id: 'google', label: 'Google Calendar' },
  { id: 'apple', label: 'Apple Calendar' },
  { id: 'outlook', label: 'Outlook' },
]

// This is the "Settings" page. It opens from the profile menu at the bottom-left
// of the sidebar (not from the main nav).
function SettingsView() {
  // Keep each toggle's on/off state in an object like { deadline: true, ... }
  const [notifications, setNotifications] = useState(() =>
    Object.fromEntries(initialNotifications.map((n) => [n.id, n.on])),
  )
  const [exported, setExported] = useState(false)

  function toggle(id) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <PageHeader title="Notifications & Export" />
      <div className="page-body">
        <div className="settings-layout">
          {/* Left: email notification switches */}
          <div className="settings-card">
            <h2 className="settings-card-title">Email notifications</h2>
            {initialNotifications.map((n) => (
              <div key={n.id} className="notif-row">
                <div className="notif-text">
                  <div className="t">{n.title}</div>
                  <div className="s">{n.sub}</div>
                </div>
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={notifications[n.id]}
                    onChange={() => toggle(n.id)}
                  />
                  <span className="slider" />
                </label>
              </div>
            ))}
          </div>

          {/* Right: export your schedule */}
          <div className="settings-card">
            <h2 className="settings-card-title">Export your schedule</h2>
            <p className="export-desc">
              Download a standards-compliant .ics file and import it into any calendar app.
            </p>

            {calendarApps.map((app) => (
              <div key={app.id} className="export-app">
                {app.label}
                <button className="export-open">Open</button>
              </div>
            ))}

            {/* Clicking download just shows the success message for now */}
            <button className="btn-cta full" onClick={() => setExported(true)}>
              ⬇ Download .ics file
            </button>

            {exported && (
              <div className="export-success">✓ Schedule exported — 7 events ready to import.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsView
