import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const times = ['8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']

// The four states a time slot can be in. Clicking a slot moves to the next one.
const states = ['free', 'class', 'work', 'blocked']

// Default grid used until the student's saved availability loads (or if none saved).
function makeStartingGrid() {
  const grid = times.map(() => days.map(() => 'free'))
  const set = (t, d, v) => (grid[t][d] = v)
  set(0, 2, 'class'); set(0, 4, 'class')
  set(1, 2, 'class'); set(1, 4, 'class')
  set(2, 0, 'class'); set(2, 1, 'class'); set(2, 3, 'class')
  set(3, 0, 'class'); set(3, 1, 'class'); set(3, 3, 'class')
  set(4, 1, 'work'); set(4, 2, 'work')
  set(5, 1, 'work'); set(5, 2, 'work')
  set(7, 0, 'blocked'); set(7, 1, 'blocked'); set(7, 2, 'blocked')
  return grid
}

function AvailabilityView() {
  const [grid, setGrid] = useState(makeStartingGrid)
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
        if (Array.isArray(p.availabilityGrid) && p.availabilityGrid.length === times.length) {
          setGrid(p.availabilityGrid)
        }
        setMaxHours(p.maxStudyHours)
        setFocus(p.focusTime)
        setBreakMins(p.minBreakMins)
        setNotify(p.notifyBeforeBlocks)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load preferences'))
  }, [])

  function cycleSlot(timeIndex, dayIndex) {
    setSaved(false)
    setGrid((prev) => {
      const next = prev.map((row) => [...row])
      const current = next[timeIndex][dayIndex]
      next[timeIndex][dayIndex] = states[(states.indexOf(current) + 1) % states.length]
      return next
    })
  }

  async function save() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      await api.put('/api/student/preferences', {
        availabilityGrid: grid,
        maxStudyHours: maxHours,
        focusTime: focus,
        minBreakMins: breakMins,
        notifyBeforeBlocks: notify,
      })
      setSaved(true)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not save preferences')
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
            <div className="avail-grid">
              <div />
              {days.map((d) => (
                <div key={d} className="avail-day">{d}</div>
              ))}

              {times.map((time, timeIndex) => (
                <Row
                  key={time}
                  time={time}
                  states={grid[timeIndex]}
                  onCycle={(dayIndex) => cycleSlot(timeIndex, dayIndex)}
                />
              ))}
            </div>

            <div className="avail-legend">
              <span className="legend-item"><span className="legend-swatch free" /> Free</span>
              <span className="legend-item"><span className="legend-swatch class" /> Class</span>
              <span className="legend-item"><span className="legend-swatch work" /> Work</span>
              <span className="legend-item"><span className="legend-swatch blocked" /> Blocked</span>
            </div>
          </div>

          <div className="prefs-card">
            <h2 className="prefs-title">Study preferences</h2>

            <div className="pref-block">
              <label className="pref-label">Max study hours / day</label>
              <div className="pref-slider-row">
                <input
                  className="pref-slider"
                  type="range"
                  min="1"
                  max="12"
                  value={maxHours}
                  onChange={(e) => { setMaxHours(Number(e.target.value)); setSaved(false) }}
                />
                <span className="pref-slider-value">{maxHours}h</span>
              </div>
            </div>

            <div className="pref-block">
              <label className="pref-label">Preferred focus time</label>
              <div className="focus-pills">
                {['Morning', 'Evening', 'Late night'].map((option) => (
                  <button
                    key={option}
                    className={`focus-pill ${focus === option ? 'active' : ''}`}
                    onClick={() => { setFocus(option); setSaved(false) }}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-block">
              <label className="pref-label">Minimum break between blocks</label>
              <div className="stepper">
                <button onClick={() => { setBreakMins((m) => Math.max(0, m - 5)); setSaved(false) }}>−</button>
                <span>{breakMins} min</span>
                <button onClick={() => { setBreakMins((m) => m + 5); setSaved(false) }}>+</button>
              </div>
            </div>

            <div className="pref-block toggle-row">
              <label className="pref-label" style={{ marginBottom: 0 }}>Notify before study blocks</label>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={notify}
                  onChange={(e) => { setNotify(e.target.checked); setSaved(false) }}
                />
                <span className="slider" />
              </label>
            </div>

            {error && <p className="error-text">{error}</p>}

            <button className="btn-cta full" onClick={save} disabled={saving}>
              {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save preferences'}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

function Row({ time, states, onCycle }) {
  return (
    <>
      <div className="avail-time">{time}</div>
      {states.map((state, dayIndex) => (
        <div
          key={dayIndex}
          className={`avail-cell ${state}`}
          onClick={() => onCycle(dayIndex)}
        />
      ))}
    </>
  )
}

export default AvailabilityView
