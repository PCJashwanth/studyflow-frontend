import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']
const dayIndex = (iso) => (new Date(iso).getUTCDay() + 6) % 7

function currentMonday() {
  const now = new Date()
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d
}
const addDays = (date, n) => {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + n)
  return d
}
const fmtDay = (d) => d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', timeZone: 'UTC' })
const fmtRange = (mon) =>
  `${mon.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' })} – ${addDays(mon, 6).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}`

function CalendarView() {
  const [monday, setMonday] = useState(currentMonday)
  const [blocks, setBlocks] = useState([])
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/tasks').then((r) => setTasks(r.data.tasks)).catch(() => {})
    // Open on the week that actually holds the student's schedule.
    api
      .get('/api/schedule')
      .then((r) => {
        if (r.data.blocks.length) setMonday(new Date(r.data.weekStart))
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const ws = monday.toISOString().slice(0, 10)
    api
      .get(`/api/schedule?weekStart=${ws}`)
      .then((r) => setBlocks(r.data.blocks))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load schedule'))
  }, [monday])

  const days = Array.from({ length: 7 }, (_, i) => addDays(monday, i))
  const weekEnd = addDays(monday, 7)
  // deadlines falling within this week, grouped by day index
  const deadlinesByDay = {}
  for (const t of tasks) {
    const dl = new Date(t.deadline)
    if (dl >= monday && dl < weekEnd) {
      const i = dayIndex(t.deadline)
      ;(deadlinesByDay[i] = deadlinesByDay[i] || []).push(t)
    }
  }

  return (
    <>
      <PageHeader title="Calendar" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        <div className="calendar-toolbar">
          <div className="cal-nav">
            <button className="cal-arrow" onClick={() => setMonday((m) => addDays(m, -7))}>‹</button>
            {fmtRange(monday)}
            <button className="cal-arrow" onClick={() => setMonday((m) => addDays(m, 7))}>›</button>
          </div>
          <button className="today-btn" onClick={() => setMonday(currentMonday())}>Today</button>
        </div>

        <div className="cal-week">
          <div className="cal-week-head">
            <div />
            {days.map((d) => (
              <div key={d.toISOString()}>{fmtDay(d)}</div>
            ))}
          </div>

          {times.map((time) => {
            const hour = parseInt(time, 10)
            return (
              <div key={time} className="cal-row">
                <div className="cal-time">{time}</div>
                {days.map((_, di) => {
                  const studyHere = blocks.filter((b) => dayIndex(b.start) === di && new Date(b.start).getUTCHours() === hour)
                  const deadlineHere = hour === 8 ? deadlinesByDay[di] || [] : []
                  return (
                    <div key={di} className="cal-cell">
                      {deadlineHere.length > 0 && (
                        <div className="cal-event deadline">
                          ⚠ {deadlineHere.length === 1 ? deadlineHere[0].title : `${deadlineHere.length} deadlines`}
                        </div>
                      )}
                      {studyHere.map((b) => (
                        <div key={b.id} className={`cal-event study ${b.rationale ? 'has-tip' : ''}`}>
                          {b.title.replace(/^Study:\s*/, '')}
                          {b.rationale && (
                            <span className="tip">
                              <span className="tip-title">Why this block?</span>
                              {b.rationale}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <p className="muted" style={{ marginTop: 12 }}>
          Study blocks come from your AI schedule (generate one on the <strong>AI Schedule</strong> page). Red = deadlines.
        </p>
      </div>
    </>
  )
}

export default CalendarView
