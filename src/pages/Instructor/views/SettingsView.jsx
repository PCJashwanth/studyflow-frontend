import { useState, useEffect } from 'react'
import InstructorHeader from './InstructorHeader'
import { api } from '../../../lib/api'

const notifDefs = [
  { id: 'digest', title: 'Weekly workload digest', sub: 'Sunday summary of class load' },
  { id: 'collision', title: 'Deadline-collision alerts', sub: 'When a deadline hits a peak week' },
  { id: 'lowCompletion', title: 'Low-completion alerts', sub: 'When on-time % drops below 70%' },
  { id: 'newStudent', title: 'New-student tracking', sub: 'When students start tracking the course' },
]
const NOTIF_DEFAULTS = { digest: true, collision: true, lowCompletion: false, newStudent: true }

function SettingsView() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [department, setDepartment] = useState('Computer Science')
  const [notifications, setNotifications] = useState(NOTIF_DEFAULTS)
  const [cohortSize, setCohortSize] = useState(10)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/settings')
      .then((r) => {
        setFullName(r.data.fullName)
        setEmail(r.data.email)
        const s = r.data.settings || {}
        if (s.department) setDepartment(s.department)
        if (s.notifications) setNotifications({ ...NOTIF_DEFAULTS, ...s.notifications })
        if (typeof s.cohortSize === 'number') setCohortSize(s.cohortSize)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load settings'))
  }, [])

  const dirty = () => setSaved(false)
  function toggle(id) {
    setNotifications((prev) => ({ ...prev, [id]: !prev[id] }))
    dirty()
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/api/settings', {
        fullName,
        settings: { department, notifications, cohortSize },
      })
      setSaved(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <InstructorHeader title="Settings" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        <div className="settings-layout">
          <div className="settings-card">
            <h2 className="settings-card-title">Profile</h2>
            <div className="settings-field">
              <label>Full name</label>
              <input type="text" value={fullName} onChange={(e) => { setFullName(e.target.value); dirty() }} />
            </div>
            <div className="settings-field">
              <label>Institutional email</label>
              <input type="email" value={email} readOnly />
            </div>
            <div className="settings-field">
              <label>Department</label>
              <input type="text" value={department} onChange={(e) => { setDepartment(e.target.value); dirty() }} />
            </div>
          </div>

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
        </div>

        <div className="settings-card analytics-card">
          <h2 className="settings-card-title">Analytics &amp; privacy</h2>
          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Anonymized aggregate only</div>
              <div className="s">🔒 Always on — StudyFlow never exposes individual student data to instructors.</div>
            </div>
            <div className="lock-toggle">
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
              <button onClick={() => { setCohortSize((n) => Math.max(1, n - 1)); dirty() }}>−</button>
              <span>{cohortSize}</span>
              <button onClick={() => { setCohortSize((n) => n + 1); dirty() }}>+</button>
            </div>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-cta" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save preferences'}
          </button>
        </div>
      </div>
    </>
  )
}

export default SettingsView
