import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

// Board columns map to backend task statuses. Cards move between them by
// PATCHing the task's status (a simple stand-in for drag-and-drop).
const COLUMNS = [
  { name: 'To Do', status: 'NOT_STARTED' },
  { name: 'In Progress', status: 'IN_PROGRESS' },
  { name: 'Done', status: 'COMPLETE' },
]
const COLORS = ['green', 'blue', 'purple', 'orange']

function KanbanView() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/tasks')
      .then((r) => setTasks(r.data.tasks))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load tasks'))
      .finally(() => setLoading(false))
  }, [])

  const codes = [...new Set(tasks.map((t) => t.course.code))]
  const colorOf = (code) => COLORS[codes.indexOf(code) % COLORS.length]

  async function move(task, dir) {
    const order = COLUMNS.map((c) => c.status)
    const nextIdx = order.indexOf(task.status) + dir
    if (nextIdx < 0 || nextIdx >= order.length) return
    try {
      const { data } = await api.patch(`/api/tasks/${task.id}`, { status: order[nextIdx] })
      setTasks((list) => list.map((x) => (x.id === task.id ? data.task : x)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not move task')
    }
  }

  return (
    <>
      <PageHeader title="Kanban Board" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="kanban-board">
            {COLUMNS.map((column, ci) => {
              const cards = tasks.filter((t) => t.status === column.status)
              return (
                <div key={column.name} className="kanban-col">
                  <div className="kanban-col-head">
                    {column.name}
                    <span className="kanban-count">{cards.length}</span>
                  </div>

                  {cards.map((card) => (
                    <div key={card.id} className="kanban-card">
                      <div className="kanban-card-title">
                        <span className={`course-dot ${colorOf(card.course.code)}`} />
                        {card.title}
                      </div>
                      <span className="kanban-course">{card.course.code}</span>
                      <div className="kanban-move">
                        <button
                          className="kanban-move-btn"
                          disabled={ci === 0}
                          onClick={() => move(card, -1)}
                          title="Move left"
                        >
                          ◀
                        </button>
                        <button
                          className="kanban-move-btn"
                          disabled={ci === COLUMNS.length - 1}
                          onClick={() => move(card, 1)}
                          title="Move right"
                        >
                          ▶
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default KanbanView
