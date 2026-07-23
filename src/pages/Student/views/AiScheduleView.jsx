//Contains sample data now to show how it would look like when is wired with backend and has some real data
import { useState } from 'react'
import PageHeader from './PageHeader'

// The things the "assistant" looked at to build the schedule (left panel).
const factors = [
  { id: 1, emoji: '📌', title: '3 deadlines', sub: 'all due Friday' },
  { id: 2, emoji: '🕐', title: 'Availability', sub: 'weekday evenings free' },
  { id: 3, emoji: '⭐', title: 'Preferences', sub: 'evenings · 6h/day max' },
  { id: 4, emoji: '📊', title: 'History', sub: 'skips Sunday mornings' },
  { id: 5, emoji: '⚡', title: 'Effort', sub: '14h total estimated' },
]

// The generated study week (right panel). One list of blocks per day.
// `highlight` just makes one block stand out (like the mockup) and it carries
// the "why" tooltip text.
const week = [
  { day: 'Mon', blocks: [{ id: 1, title: 'Cloud reading', hrs: '2h' }] },
  {
    day: 'Tue',
    blocks: [
      { id: 2, title: 'CSCI 5709 final', hrs: '2h', highlight: true, why: 'Placed here because the deadline is Friday, you marked evenings as high-focus time, and the estimated effort is 6 hours.' },
      { id: 3, title: 'Olist write-up', hrs: '1.5h' },
    ],
  },
  { day: 'Wed', blocks: [{ id: 4, title: 'Lab 4', hrs: '2h' }] },
  { day: 'Thu', blocks: [{ id: 5, title: 'Assign 3', hrs: '3h' }] },
  { day: 'Fri', blocks: [{ id: 6, title: 'Review', hrs: '2h' }] },
]

function AiScheduleView() {
  // Once the student clicks "Accept schedule" we show a little confirmation.
  const [accepted, setAccepted] = useState(false)

  return (
    <>
      <PageHeader title="AI Study Schedule" />
      <div className="page-body">
        <div className="ai-topbar">
          <span className="ai-status">✓ Generated · 7 blocks · 12.5h</span>
          <div className="ai-actions">
            <button className="btn-outline">↻ Regenerate</button>
            <button className="btn-cta" onClick={() => setAccepted(true)}>
              {accepted ? '✓ Accepted' : 'Accept schedule'}
            </button>
          </div>
        </div>

        <div className="ai-layout">
          {/* Left: what the assistant used */}
          <div className="ai-factors-card">
            <h2 className="ai-card-title">What the assistant used</h2>
            {factors.map((f) => (
              <div key={f.id} className="factor">
                <div className="factor-title">{f.emoji} {f.title}</div>
                <div className="factor-sub">{f.sub}</div>
              </div>
            ))}
          </div>

          {/* Right: the generated week */}
          <div className="ai-week-card">
            <h2 className="ai-card-title">Your generated week</h2>
            <div className="ai-week">
              {week.map((column) => (
                <div key={column.day}>
                  <div className="ai-day-name">{column.day}</div>
                  {column.blocks.map((block) => (
                    <div
                      key={block.id}
                      className={`ai-block ${block.highlight ? 'highlight' : ''} ${block.why ? 'has-tip' : ''}`}
                    >
                      {block.title}
                      <span className="hrs">{block.hrs}</span>
                      {block.why && (
                        <span className="tip">
                          <span className="tip-title">Tue 7–9 PM · {block.title}</span>
                          {block.why}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AiScheduleView
