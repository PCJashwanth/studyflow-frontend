import { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import { api } from '../../../lib/api'

const securityDefs = [
  { id: 'sso', title: 'Enforce institutional SSO', sub: 'Sign in through the university IdP' },
  { id: 'twofa', title: 'Require 2FA for staff', sub: 'Instructors and admins must enroll' },
  { id: 'newDevice', title: 'Email on new-device sign-in', sub: 'Notify users of unrecognized logins' },
  { id: 'lockout', title: 'Lock account after 5 failed attempts', sub: 'Temporary lockout to deter brute force' },
]
const SEC_DEFAULTS = { sso: true, twofa: true, newDevice: true, lockout: false }
const INST_DEFAULTS = { name: 'Dalhousie University', term: 'Fall 2026', timezone: 'America/Halifax (AST)' }

function SettingsView() {
  const [inst, setInst] = useState(INST_DEFAULTS)
  const [security, setSecurity] = useState(SEC_DEFAULTS)
  const [cohort, setCohort] = useState(10)
  const [retention, setRetention] = useState('24 months')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/settings')
      .then((r) => {
        const s = r.data.settings || {}
        if (s.institution) setInst({ ...INST_DEFAULTS, ...s.institution })
        if (s.security) setSecurity({ ...SEC_DEFAULTS, ...s.security })
        if (typeof s.cohort === 'number') setCohort(s.cohort)
        if (s.retention) setRetention(s.retention)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load settings'))
  }, [])

  const dirty = () => setSaved(false)
  function toggle(id) {
    setSecurity((prev) => ({ ...prev, [id]: !prev[id] }))
    dirty()
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/api/settings', {
        settings: { institution: inst, security, cohort, retention },
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
      <AdminHeader title="Settings" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        <div className="settings-layout">
          <div className="settings-card">
            <h2 className="settings-card-title">Institution</h2>
            <div className="settings-field">
              <label>Institution name</label>
              <input type="text" value={inst.name} onChange={(e) => { setInst({ ...inst, name: e.target.value }); dirty() }} />
            </div>
            <div className="settings-field">
              <label>Current academic term</label>
              <input type="text" value={inst.term} onChange={(e) => { setInst({ ...inst, term: e.target.value }); dirty() }} />
            </div>
            <div className="settings-field">
              <label>Timezone</label>
              <input type="text" value={inst.timezone} onChange={(e) => { setInst({ ...inst, timezone: e.target.value }); dirty() }} />
            </div>
          </div>

          <div className="settings-card">
            <h2 className="settings-card-title">Security</h2>
            {securityDefs.map((t) => (
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

        <div className="settings-card analytics-card">
          <h2 className="settings-card-title">Data &amp; privacy</h2>
          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Instructor-analytics cohort threshold</div>
              <div className="s">Class analytics stay hidden until at least this many students are tracking a course.</div>
            </div>
            <div className="stepper">
              <button onClick={() => { setCohort((n) => Math.max(1, n - 1)); dirty() }}>−</button>
              <span>{cohort}</span>
              <button onClick={() => { setCohort((n) => n + 1); dirty() }}>+</button>
            </div>
          </div>

          <div className="lock-row">
            <div className="notif-text">
              <div className="t">Activity-log retention</div>
              <div className="s">How long audit-log entries are kept before automatic deletion.</div>
            </div>
            <select className="course-select" value={retention} onChange={(e) => { setRetention(e.target.value); dirty() }}>
              <option>6 months</option>
              <option>12 months</option>
              <option>24 months</option>
              <option>36 months</option>
            </select>
          </div>
        </div>

        <div className="settings-actions">
          <button className="btn-admin" onClick={save} disabled={saving}>
            {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save changes'}
          </button>
        </div>
      </div>
    </>
  )
}

export default SettingsView
