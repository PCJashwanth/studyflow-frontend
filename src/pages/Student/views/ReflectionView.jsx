//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import PageHeader from './PageHeader'

// Things the app "noticed" about the student's week (left panel).
const patterns = [
  { id: 1, emoji: '💤', text: 'You consistently skipped Sunday-morning blocks (3 weeks running).' },
  { id: 2, emoji: '🌙', text: 'Evening blocks had your highest completion rate — 92%.' },
  { id: 3, emoji: '⏱️', text: "Tasks tagged 'High' took ~30% longer than your estimates." },
]

// Suggestions for next week, each with an "Accept" button (right panel).
const suggestions = [
  { id: 1, text: 'Move Sunday blocks to Saturday evening' },
  { id: 2, text: "Add 30% buffer to 'High' priority estimates" },
  { id: 3, text: 'Front-load Cloud reading before Wednesday' },
]

function ReflectionView() {
  // Remember which suggestions the student has accepted (by id).
  const [accepted, setAccepted] = useState([])

  function accept(id) {
    // Add the id to the list, but only if it isn't already there.
    setAccepted((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <>
      <PageHeader title="Weekly Reflection" />
      <div className="page-body">
        <p className="section-sub">Your week in review · June 1–7</p>

        {/* Three summary numbers — reuses the dashboard stat-card styles */}
        <div className="stats-row">
          <div className="stat-card green-accent">
            <span className="stat-value">9 / 12</span>
            <span className="stat-label">Tasks completed on time</span>
          </div>
          <div className="stat-card orange-accent">
            <span className="stat-value">3</span>
            <span className="stat-label">Blocks slipped</span>
          </div>
          <div className="stat-card blue-accent">
            <span className="stat-value">75%</span>
            <span className="stat-label">Completion rate</span>
          </div>
        </div>

        <div className="content-grid">
          {/* Left: patterns we noticed */}
          <div className="panel">
            <h2 className="panel-title">Patterns we noticed</h2>
            <ul className="insight-list">
              {patterns.map((p) => (
                <li key={p.id} className="insight-item">
                  <span className="insight-emoji">{p.emoji}</span>
                  {p.text}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: suggestions with Accept buttons */}
          <div className="panel">
            <h2 className="panel-title">Suggestions for next week</h2>
            {suggestions.map((s) => {
              const isAccepted = accepted.includes(s.id)
              return (
                <div key={s.id} className="suggestion-item">
                  {s.text}
                  <button
                    className={`btn-small ${isAccepted ? 'accepted' : ''}`}
                    onClick={() => accept(s.id)}
                    disabled={isAccepted}
                  >
                    {isAccepted ? '✓ Accepted' : 'Accept'}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export default ReflectionView
