import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const emptyWeek = () => Object.fromEntries(DAYS.map((d) => [d, []]))

function AvailabilityView() {
  const [availability, setAvailability] = useState(emptyWeek)
  const [focus, setFocus] = useState('Evening')
  const [maxHours, setMaxHours] = useState(6)
  const [breakMins, setBreakMins] = useState(15)
  const [notify, setNotify] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/student/preferences')
      .then((r) => {
        const p = r.data.preferences
        if (p.availability && typeof p.availability === 'object') {
          setAvailability(Object.fromEntries(DAYS.map((d) => [d, Array.isArray(p.availability[d]) ? p.availability[d] : []])))
        }
        setMaxHours(p.maxStudyHours)
        setFocus(p.focusTime)
        setBreakMins(p.minBreakMins)
        setNotify(p.notifyBeforeBlocks)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load availability'))
  }, [])

  const dirty = () => setSaved(false)
  const addRange = (day) => { setAvailability((a) => ({ ...a, [day]: [...a[day], { start: '18:00', end: '20:00' }] })); dirty() }
  const removeRange = (day, i) => { setAvailability((a) => ({ ...a, [day]: a[day].filter((_, j) => j !== i) })); dirty() }
  const setRange = (day, i, field, val) => {
    setAvailability((a) => ({ ...a, [day]: a[day].map((r, j) => (j === i ? { ...r, [field]: val } : r)) }))
    dirty()
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/api/student/preferences', {
        availability,
        maxStudyHours: maxHours,
        focusTime: focus,
        minBreakMins: breakMins,
        notifyBeforeBlocks: notify,
      })
      setSaved(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not save availability')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader title="Availability" />
      <div className="page-body">
        <div className="availability-layout">
          <div className="availability-card">
            <h2 className="prefs-title">Weekly availability</h2>
            <p className="muted" style={{ marginBottom: 12 }}>
              When are you free to study each day? Add one or more time ranges — update this whenever your work schedule changes.
            </p>

            {DAYS.map((day) => (
              <div key={day} className="avail-day-row">
                <div className="avail-day-label">{day}</div>
                <div className="avail-ranges">
                  {availability[day].length === 0 && <span className="avail-none-text">Unavailable</span>}
                  {availability[day].map((r, i) => (
                    <div key={i} className="range-row">
                      <input type="time" step="3600" value={r.start} onChange={(e) => setRange(day, i, 'start', e.target.value)} />
                      <span className="range-sep">–</span>
                      <input type="time" step="3600" value={r.end} onChange={(e) => setRange(day, i, 'end', e.target.value)} />
                      <button className="range-remove" onClick={() => removeRange(day, i)} title="Remove">✕</button>
                    </div>
                  ))}
                  <button className="range-add" onClick={() => addRange(day)}>+ Add time</button>
                </div>
              </div>
            ))}
          </div>

          <div className="prefs-card">
            <h2 className="prefs-title">Study preferences</h2>

            <div className="pref-block">
              <label className="pref-label">Max study hours / day</label>
              <div className="pref-slider-row">
                <input className="pref-slider" type="range" min="1" max="12" value={maxHours}
                  onChange={(e) => { setMaxHours(Number(e.target.value)); dirty() }} />
                <span className="pref-slider-value">{maxHours}h</span>
              </div>
            </div>

            <div className="pref-block">
              <label className="pref-label">Preferred focus time</label>
              <div className="focus-pills">
                {['Morning', 'Evening', 'Late night'].map((option) => (
                  <button key={option} className={`focus-pill ${focus === option ? 'active' : ''}`}
                    onClick={() => { setFocus(option); dirty() }}>
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-block">
              <label className="pref-label">Minimum break between blocks</label>
              <div className="stepper">
                <button onClick={() => { setBreakMins((m) => Math.max(0, m - 5)); dirty() }}>−</button>
                <span>{breakMins} min</span>
                <button onClick={() => { setBreakMins((m) => m + 5); dirty() }}>+</button>
              </div>
            </div>

            <div className="pref-block toggle-row">
              <label className="pref-label" style={{ marginBottom: 0 }}>Notify before study blocks</label>
              <label className="switch">
                <input type="checkbox" checked={notify} onChange={(e) => { setNotify(e.target.checked); dirty() }} />
                <span className="slider" />
              </label>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn-cta full" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save availability'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default AvailabilityView
