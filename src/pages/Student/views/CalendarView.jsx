//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import PageHeader from './PageHeader'

const days = ['Mon 1', 'Tue 2', 'Wed 3', 'Thu 4', 'Fri 5', 'Sat 6', 'Sun 7']
const times = ['8:00', '10:00', '12:00', '14:00', '16:00', '18:00', '20:00', '22:00']

// Sample events. `day` is 0–6 (Mon–Sun), `time` matches one of the labels above.
// `type` picks the colour: "class" (blue), "study" (green) or "deadline" (red).
// Study blocks also get a `why` explanation that shows on hover.
const events = [
  { id: 1, day: 4, time: '8:00', type: 'deadline', title: '⚠ 3 deadlines', sub: 'due today' },
  { id: 2, day: 0, time: '10:00', type: 'class', title: 'CSCI 5409', sub: 'Lecture' },
  { id: 3, day: 2, time: '10:00', type: 'class', title: 'CSCI 5709', sub: 'Lab' },
  { id: 4, day: 0, time: '18:00', type: 'study', title: 'Study: Cloud', sub: '2h', why: 'Deadline is Friday · you marked evenings as high-focus · 6h estimated effort.' },
  { id: 5, day: 1, time: '20:00', type: 'study', title: 'Study: 5709', sub: 'AI block', why: 'Deadline is Friday · you marked evenings as high-focus · 6h estimated effort.' },
  { id: 6, day: 4, time: '18:00', type: 'study', title: 'Study: Olist', sub: '', why: 'Placed on a free evening before the Friday deadline.' },
]

// Days of June 2026 for the simple month view. June 1st, 2026 is a Monday,
// so we start the grid with 0 empty cells before day 1.
const JUNE_2026_DAYS = 30
const JUNE_2026_START_OFFSET = 0

function CalendarView() {
  const [view, setView] = useState('Week') // "Week" or "Month"

  return (
    <>
      <PageHeader title="Calendar" />
      <div className="page-body">
        <div className="calendar-toolbar">
          <div className="cal-nav">
            <button className="cal-arrow">‹</button>
            June 1 – 7, 2026
            <button className="cal-arrow">›</button>
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

          <button className="today-btn">Today</button>
        </div>

        {view === 'Week' ? <WeekView /> : <MonthView />}
      </div>
    </>
  )
}

// The detailed week grid: day columns across the top, time slots down the side.
function WeekView() {
  return (
    <div className="cal-week">
      <div className="cal-week-head">
        <div /> {/* empty corner above the time column */}
        {days.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      {times.map((time) => (
        <div key={time} className="cal-row">
          <div className="cal-time">{time}</div>
          {days.map((_, dayIndex) => {
            // Find the event (if any) that belongs in this day + time cell
            const event = events.find((e) => e.day === dayIndex && e.time === time)
            return (
              <div key={dayIndex} className="cal-cell">
                {event && <EventBlock event={event} />}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

// One coloured event box. Study blocks get a hover tooltip explaining the "why".
function EventBlock({ event }) {
  return (
    <div className={`cal-event ${event.type} ${event.why ? 'has-tip' : ''}`}>
      {event.title}
      {event.sub && <span className="sub">{event.sub}</span>}
      {event.why && (
        <span className="tip">
          <span className="tip-title">Why this block?</span>
          {event.why}
        </span>
      )}
    </div>
  )
}

// A simple month grid (just the dates — no events). Good enough as a second view.
function MonthView() {
  const dow = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const cells = []

  // Blank cells for the days before the 1st
  for (let i = 0; i < JUNE_2026_START_OFFSET; i++) {
    cells.push(<div key={`empty-${i}`} className="cal-month-cell empty" />)
  }
  // One cell per day of the month; highlight the 5th (the "today" in our demo)
  for (let day = 1; day <= JUNE_2026_DAYS; day++) {
    cells.push(
      <div key={day} className={`cal-month-cell ${day === 5 ? 'today' : ''}`}>
        {day}
      </div>,
    )
  }

  return (
    <div className="cal-month">
      <div className="cal-month-grid">
        {dow.map((d) => (
          <div key={d} className="cal-month-dow">{d}</div>
        ))}
        {cells}
      </div>
    </div>
  )
}

export default CalendarView
