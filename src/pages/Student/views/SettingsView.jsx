import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const notifDefs = [
  { id: 'deadline', title: 'Deadline reminders', sub: '24h before each due date' },
  { id: 'blockStart', title: 'Study block start', sub: 'At the start of each block' },
  { id: 'reflection', title: 'Weekly reflection', sub: 'Sunday evening summary' },
  { id: 'digest', title: 'Daily digest', sub: 'Every morning at 8 AM' },
]
const DEFAULTS = { deadline: true, blockStart: true, reflection: true, digest: false }

const calendarApps = [
  { id: 'google', label: 'Google Calendar' },
  { id: 'apple', label: 'Apple Calendar' },
  { id: 'outlook', label: 'Outlook' },
]

function SettingsView() {
  const [notifications, setNotifications] = useState(DEFAULTS)
  const [exported, setExported] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/settings')
      .then((r) => {
        if (r.data.settings?.notifications) {
          setNotifications({ ...DEFAULTS, ...r.data.settings.notifications })
        }
      })
      .catch(() => {})
  }, [])

  async function toggle(id) {
    const next = { ...notifications, [id]: !notifications[id] }
    setNotifications(next)
    setError('')
    try {
      await api.put('/api/settings', { settings: { notifications: next } })
    } catch {
      setError('Could not save notification setting')
    }
  }

  async function downloadIcs() {
    setError('')
    try {
      const res = await api.get('/api/export/schedule.ics', { responseType: 'blob' })
      const count = res.headers['x-event-count']
      const url = URL.createObjectURL(res.data)
      const a = document.createElement('a')
      a.href = url
      a.download = 'studyflow.ics'
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      setExported({ count })
    } catch {
      setError('Could not export schedule')
    }
  }

  return (
    <>
      <PageHeader title="Notifications & Export" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        <div className="settings-layout">
          <div className="settings-card">
            <h2 className="settings-card-title">Email notifications</h2>
            {notifDefs.map((n) => (
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

          <div className="settings-card">
            <h2 className="settings-card-title">Export your schedule</h2>
            <p className="export-desc">
              Download a standards-compliant .ics file of your task deadlines and import it into any calendar app.
            </p>

            {calendarApps.map((app) => (
              <div key={app.id} className="export-app">
                {app.label}
                <button className="export-open" onClick={downloadIcs}>Open</button>
              </div>
            ))}

            <button className="btn-cta full" onClick={downloadIcs}>
              ⬇ Download .ics file
            </button>

            {exported && (
              <div className="export-success">✓ Schedule exported — {exported.count} events ready to import.</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default SettingsView
