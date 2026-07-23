import { useState } from 'react'
import AdminHeader from './AdminHeader'

// Security toggles and their starting on/off values.
const securityToggles = [
  { id: 'sso', title: 'Enforce institutional SSO', sub: 'Sign in through the university IdP', on: true },
  { id: 'twofa', title: 'Require 2FA for staff', sub: 'Instructors and admins must enroll', on: true },
  { id: 'newDevice', title: 'Email on new-device sign-in', sub: 'Notify users of unrecognized logins', on: true },
  { id: 'lockout', title: 'Lock account after 5 failed attempts', sub: 'Temporary lockout to deter brute force', on: false },
]

// This is the admin Settings page. 
function SettingsView() {
  const [security, setSecurity] = useState(() =>
    Object.fromEntries(securityToggles.map((t) => [t.id, t.on])),
  )
  const [cohort, setCohort] = useState(10)
  const [retention, setRetention] = useState('24 months')

  function toggle(id) {
    setSecurity((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <>
      <AdminHeader title="Settings" />
      <div className="page-body">
        {/* Top: Institution + Security side by side */}
        <div className="settings-layout">
          <div className="settings-card">
            <h2 className="settings-card-title">Institution</h2>

            <div className="settings-field">
              <label>Institution name</label>
              <input type="text" defaultValue="Dalhousie University" />
            </div>
            <div className="settings-field">
              <label>Current academic term</label>
              <input type="text" defaultValue="Fall 2026" />
            </div>
            <div className="settings-field">
              <label>Timezone</label>
              <input type="text" defaultValue="America/Halifax (AST)" />
            </div>
          </div>

          <div className="settings-card">
            <h2 className="settings-card-title">Security</h2>
            {securityToggles.map((t) => (
              <div key={t.id} className="notif-row">
                <div className="notif-text">
                  <div className="t">{t.title}</div>
                  <div className="s">{t.sub}</div>
                </div>
                <label className="switch">
                  <input type="checkbox" checked={security[t.id]} onChange={() => toggle(t.id)} />
                  <span className="slider" />
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Data & privacy (full width) */}
        <div className="settings-card analytics-card">
          <h2 className="settings-card-title">Data &amp; privacy</h2>

          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Instructor-analytics cohort threshold</div>
              <div className="s">Class analytics stay hidden until at least this many students are tracking a course.</div>
            </div>
            <div className="stepper">
              {/* Don't let the threshold drop below 1 student */}
              <button onClick={() => setCohort((n) => Math.max(1, n - 1))}>−</button>
              <span>{cohort}</span>
              <button onClick={() => setCohort((n) => n + 1)}>+</button>
            </div>
          </div>

          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Activity-log retention</div>
              <div className="s">How long audit-log entries are kept before automatic deletion.</div>
            </div>
            <select className="course-select" value={retention} onChange={(e) => setRetention(e.target.value)}>
              <option>6 months</option>
              <option>12 months</option>
              <option>24 months</option>
              <option>36 months</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-admin">Save changes</button>
        </div>
      </div>
    </>
  )
}

export default SettingsView
