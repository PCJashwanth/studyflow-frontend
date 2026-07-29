import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

// Map backend enums <-> the labels/classes the UI already styles in App.css.
const PRIORITY_LABEL = { HIGH: 'High', MEDIUM: 'Med', LOW: 'Low' }
const STATUS_LABEL = {
  NOT_STARTED: 'Not started',
  IN_PROGRESS: 'In progress',
  COMPLETE: 'Done',
  SKIPPED: 'Skipped',
}
const COURSE_COLORS = ['green', 'blue', 'purple', 'orange']
const priorityClass = (label) => ({ High: 'high', Med: 'medium', Low: 'low' }[label] || 'low')
const statusClass = (label) => label.toLowerCase().replace(/\s/g, '')
const weekday = (d) => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })

function CoursesTasksView() {
  const [courses, setCourses] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ courseId: '', title: '', priority: 'MEDIUM', deadline: '' })

  useEffect(() => {
    Promise.all([api.get('/api/courses'), api.get('/api/tasks')])
      .then(([c, t]) => {
        setCourses(c.data.courses)
        setTasks(t.data.tasks)
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load courses and tasks'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleDone(task) {
    const next = task.status === 'COMPLETE' ? 'NOT_STARTED' : 'COMPLETE'
    try {
      const { data } = await api.patch(`/api/tasks/${task.id}`, { status: next })
      setTasks((list) => list.map((x) => (x.id === task.id ? data.task : x)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not update task')
    }
  }

  async function remove(task) {
    try {
      await api.delete(`/api/tasks/${task.id}`)
      setTasks((list) => list.filter((x) => x.id !== task.id))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not delete task')
    }
  }

  async function addTask(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/tasks', {
        courseId: form.courseId,
        title: form.title,
        priority: form.priority,
        deadline: form.deadline,
      })
      setTasks((list) => [...list, data.task])
      setShowAdd(false)
      setForm({ courseId: '', title: '', priority: 'MEDIUM', deadline: '' })
    } catch (err) {
      const d = err.response?.data
      setError((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not add task')
    }
  }

  function taskMatches(task) {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    let matchesFilter = true
    if (filter === 'In progress') matchesFilter = task.status === 'IN_PROGRESS'
    if (filter === 'High priority') matchesFilter = task.priority === 'HIGH'
    return matchesSearch && matchesFilter
  }

  return (
    <>
      <PageHeader title="Courses & Tasks" />
      <div className="page-body">
        <div className="tasks-toolbar">
          <input
            className="task-search-input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {['All', 'In progress', 'High priority'].map((f) => (
            <button
              key={f}
              className={`filter-pill ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
          <span className="toolbar-spacer" />
          <button className="btn-cta" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? 'Cancel' : '+ Add task'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {showAdd && (
          <form className="add-task-form" onSubmit={addTask}>
            <select
              required
              value={form.courseId}
              onChange={(e) => setForm({ ...form, courseId: e.target.value })}
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title}</option>
              ))}
            </select>
            <input
              required
              placeholder="Task title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Med</option>
              <option value="HIGH">High</option>
            </select>
            <input
              required
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
            />
            <button className="btn-cta" type="submit">Save</button>
          </form>
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          courses.map((course, i) => {
            const courseTasks = tasks.filter((t) => t.courseId === course.id).filter(taskMatches)
            if (courseTasks.length === 0) return null

            return (
              <div key={course.id} className="course-group">
                <div className="course-group-title">
                  <span className={`course-dot ${COURSE_COLORS[i % COURSE_COLORS.length]}`} />
                  {course.code} · {course.title}
                </div>

                {courseTasks.map((task) => {
                  const pLabel = PRIORITY_LABEL[task.priority]
                  const sLabel = STATUS_LABEL[task.status]
                  const done = task.status === 'COMPLETE'
                  return (
                    <div key={task.id} className="task-row">
                      <input
                        type="checkbox"
                        className="task-check"
                        checked={done}
                        onChange={() => toggleDone(task)}
                      />
                      <span className={`task-title ${done ? 'done' : ''}`}>{task.title}</span>
                      <span className={`priority-badge ${priorityClass(pLabel)}`}>{pLabel}</span>
                      <span className={`task-status ${statusClass(sLabel)}`}>{sLabel}</span>
                      <span className="task-due">{done ? '✓ Done' : `Due ${weekday(task.deadline)}`}</span>
                      <span className="task-icons">
                        <button className="task-icon-btn" title="Delete" onClick={() => remove(task)}>🗑️</button>
                      </span>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}
      </div>
    </>
  )
}

export default CoursesTasksView
