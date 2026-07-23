//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import PageHeader from './PageHeader'

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const times = ['8a', '10a', '12p', '2p', '4p', '6p', '8p', '10p']

// The four states a time slot can be in. Clicking a slot moves to the next one.
const states = ['free', 'class', 'work', 'blocked']

// Build the starting grid. It's an array of rows; each row is an array of 7
// states (one per day). We seed a few "class"/"work"/"blocked" slots so it
// looks like the mockup instead of being empty.
function makeStartingGrid() {
  const grid = times.map(() => days.map(() => 'free'))
  const set = (timeIndex, dayIndex, value) => (grid[timeIndex][dayIndex] = value)
  set(0, 2, 'class'); set(0, 4, 'class')             // Wed/Fri 8a
  set(1, 2, 'class'); set(1, 4, 'class')             // Wed/Fri 10a
  set(2, 0, 'class'); set(2, 1, 'class'); set(2, 3, 'class') // Mon/Tue/Thu 12p
  set(3, 0, 'class'); set(3, 1, 'class'); set(3, 3, 'class') // Mon/Tue/Thu 2p
  set(4, 1, 'work'); set(4, 2, 'work')               // Tue/Wed 4p
  set(5, 1, 'work'); set(5, 2, 'work')               // Tue/Wed 6p
  set(7, 0, 'blocked'); set(7, 1, 'blocked'); set(7, 2, 'blocked') // 10p blocked
  return grid
}

function AvailabilityView() {
  const [grid, setGrid] = useState(makeStartingGrid)
  const [focus, setFocus] = useState('Evening') // preferred focus time
  const [maxHours, setMaxHours] = useState(6)
  const [breakMins, setBreakMins] = useState(15)
  const [notify, setNotify] = useState(true)

  // Click a slot → advance it to the next state (free → class → work → blocked → free)
  function cycleSlot(timeIndex, dayIndex) {
    setGrid((prev) => {
      const next = prev.map((row) => [...row]) // copy so we don't mutate state directly
      const current = next[timeIndex][dayIndex]
      const nextState = states[(states.indexOf(current) + 1) % states.length]
      next[timeIndex][dayIndex] = nextState
      return next
    })
  }

  return (
    <>
      <PageHeader title="Availability" />
      <div className="page-body">
        <div className="availability-layout">
          {/* Left: the weekly grid you click to set your availability */}
          <div className="availability-card">
            <div className="avail-grid">
              {/* Top row: an empty corner, then the day names */}
              <div />
              {days.map((d) => (
                <div key={d} className="avail-day">{d}</div>
              ))}

              {/* One row per time slot */}
              {times.map((time, timeIndex) => (
                <Row
                  key={time}
                  time={time}
                  states={grid[timeIndex]}
                  onCycle={(dayIndex) => cycleSlot(timeIndex, dayIndex)}
                />
              ))}
            </div>

            {/* Colour legend */}
            <div className="avail-legend">
              <span className="legend-item"><span className="legend-swatch free" /> Free</span>
              <span className="legend-item"><span className="legend-swatch class" /> Class</span>
              <span className="legend-item"><span className="legend-swatch work" /> Work</span>
              <span className="legend-item"><span className="legend-swatch blocked" /> Blocked</span>
            </div>
          </div>

          {/* Right: study preferences */}
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
                  onChange={(e) => setMaxHours(Number(e.target.value))}
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
                    onClick={() => setFocus(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="pref-block">
              <label className="pref-label">Minimum break between blocks</label>
              <div className="stepper">
                {/* Don't let the break go below 0 minutes */}
                <button onClick={() => setBreakMins((m) => Math.max(0, m - 5))}>−</button>
                <span>{breakMins} min</span>
                <button onClick={() => setBreakMins((m) => m + 5)}>+</button>
              </div>
            </div>

            <div className="pref-block toggle-row">
              <label className="pref-label" style={{ marginBottom: 0 }}>Notify before study blocks</label>
              <label className="switch">
                <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} />
                <span className="slider" />
              </label>
            </div>

            <button className="btn-cta full">Save preferences</button>
          </div>
        </div>
      </div>
    </>
  )
}

// A single time row: the time label on the left, then a clickable cell per day.
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
