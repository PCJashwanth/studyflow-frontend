import { useState, useEffect, useMemo } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

// Each row covers two hours, so a deadline at 21:00 lands in the 20:00 row.
const slotHours = [8, 10, 12, 14, 16, 18, 20, 22]

function slotIndexFor(date) {
  const hour = date.getHours()
  let index = 0
  for (let i = 0; i < slotHours.length; i++) {
    if (hour >= slotHours[i]) index = i
  }
  return index // anything before 8am shows in the first row
}

// Monday of the week the given date falls in.
function mondayOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)) // getDay is Sun-based, we want Mon
  return d
}

function addDays(date, n) {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

function sameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

function CalendarView() {
  const [view, setView] = useState('Week') // "Week" or "Month"
  const [anchor, setAnchor] = useState(() => new Date()) // any date inside the shown range
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState('')

  const weekStart = useMemo(() => mondayOf(anchor), [anchor])

  // The span we need tasks for: the visible week, or the whole visible month.
  const range = useMemo(() => {
    if (view === 'Week') return { from: weekStart, to: addDays(weekStart, 7) }
    const first = new Date(anchor.getFullYear(), anchor.getMonth(), 1)
    const afterLast = new Date(anchor.getFullYear(), anchor.getMonth() + 1, 1)
    return { from: first, to: afterLast }
  }, [view, weekStart, anchor])

  useEffect(() => {
    api
      .get('/api/tasks', {
        params: { from: range.from.toISOString(), to: range.to.toISOString() },
      })
      .then((r) => setTasks(r.data.tasks))
      .catch((e) => setError(e.response?.data?.error || 'Could not load your deadlines'))
  }, [range.from, range.to])

  function step(direction) {
    setAnchor((prev) =>
      view === 'Week'
        ? addDays(prev, direction * 7)
        : new Date(prev.getFullYear(), prev.getMonth() + direction, 1),
    )
  }

  const label =
    view === 'Week'
      ? `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} – ${monthNames[addDays(weekStart, 6).getMonth()]} ${addDays(weekStart, 6).getDate()}, ${weekStart.getFullYear()}`
      : `${monthNames[anchor.getMonth()]} ${anchor.getFullYear()}`

  return (
    <>
      <PageHeader title="Calendar" />
      <div className="page-body">
        <div className="calendar-toolbar">
          <div className="cal-nav">
            <button className="cal-arrow" onClick={() => step(-1)}>‹</button>
            {label}
            <button className="cal-arrow" onClick={() => step(1)}>›</button>
          </div>

          <div className="view-toggle">
            {['Week', 'Month'].map((v) => (
              <button
                key={v}
                className={`view-btn ${view === v ? 'active' : ''}`}
                onClick={() => setView(v)}
              >
                {v}
              </button>
            ))}
          </div>

          <button className="today-btn" onClick={() => setAnchor(new Date())}>Today</button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {view === 'Week' ? (
          <WeekView weekStart={weekStart} tasks={tasks} />
        ) : (
          <MonthView anchor={anchor} tasks={tasks} />
        )}
      </div>
    </>
  )
}

// Day columns across the top, two-hour slots down the side.
function WeekView({ weekStart, tasks }) {
  // Bucket each deadline into its day column and time row once, up front.
  const cells = useMemo(() => {
    const map = {}
    for (const task of tasks) {
      const due = new Date(task.deadline)
      const dueDay = new Date(due)
      dueDay.setHours(0, 0, 0, 0)

      const dayIndex = Math.round((dueDay - weekStart) / 86400000)
      if (dayIndex < 0 || dayIndex > 6) continue // outside the shown week

      const key = `${dayIndex}:${slotIndexFor(due)}`
      ;(map[key] ||= []).push(task)
    }
    return map
  }, [tasks, weekStart])

  return (
    <div className="cal-week">
      <div className="cal-week-head">
        <div /> {/* empty corner above the time column */}
        {dayNames.map((name, i) => (
          <div key={name}>
            {name} {addDays(weekStart, i).getDate()}
          </div>
        ))}
      </div>

      {times.map((time, slotIndex) => (
        <div key={time} className="cal-row">
          <div className="cal-time">{time}</div>
          {dayNames.map((_, dayIndex) => (
            <div key={dayIndex} className="cal-cell">
              {(cells[`${dayIndex}:${slotIndex}`] ?? []).map((task) => (
                <DeadlineBlock key={task.id} task={task} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

// One deadline. Finished work goes green, anything still open stays red.
function DeadlineBlock({ task }) {
  const done = task.status === 'COMPLETE' || task.status === 'SKIPPED'
  const due = new Date(task.deadline)
  const at = due.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })

  return (
    <div className={`cal-event ${done ? 'study' : 'deadline'} has-tip`}>
      {task.title}
      <span className="sub">{task.course.code} · {at}</span>
      <span className="tip">
        <span className="tip-title">{task.course.code} — {task.title}</span>
        Due {due.toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
        {' · '}{task.effortHours}h estimated · {task.priority.toLowerCase()} priority
      </span>
    </div>
  )
}

// Month grid with a count of deadlines on each day.
function MonthView({ anchor, tasks }) {
  const year = anchor.getFullYear()
  const month = anchor.getMonth()
  const today = new Date()

  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7 // Mon-based

  // How many deadlines fall on each day of this month.
  const counts = useMemo(() => {
    const map = {}
    for (const task of tasks) {
      const due = new Date(task.deadline)
      if (due.getFullYear() === year && due.getMonth() === month) {
        map[due.getDate()] = (map[due.getDate()] ?? 0) + 1
      }
    }
    return map
  }, [tasks, year, month])

  const cells = []
  for (let i = 0; i < startOffset; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-month-cell empty" />)
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const isToday = sameDay(new Date(year, month, day), today)
    cells.push(
      <div key={day} className={`cal-month-cell ${isToday ? 'today' : ''}`}>
        {day}
        {counts[day] && (
          <span className="cal-month-count">
            {counts[day]} due
          </span>
        )}
      </div>,
    )
  }

  return (
    <div className="cal-month">
      <div className="cal-month-grid">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
          <div key={d} className="cal-month-dow">{d}</div>
        ))}
        {cells}
      </div>
    </div>
  )
}

export default CalendarView
