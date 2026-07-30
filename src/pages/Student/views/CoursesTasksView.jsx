import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

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
  const [catalog, setCatalog] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ courseId: '', title: '', priority: 'MEDIUM', deadline: '' })

  const [showEnroll, setShowEnroll] = useState(false)
  const [enrollSearch, setEnrollSearch] = useState('')

  const [reqOpen, setReqOpen] = useState(false)
  const [reqForm, setReqForm] = useState({ code: '', title: '', instructorName: '', note: '' })

  const [editTask, setEditTask] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', priority: 'MEDIUM', status: 'NOT_STARTED', deadline: '' })

  useEffect(() => {
    Promise.all([api.get('/api/courses'), api.get('/api/tasks'), api.get('/api/courses/catalog')])
      .then(([c, t, cat]) => {
        setCourses(c.data.courses)
        setTasks(t.data.tasks)
        setCatalog(cat.data.catalog)
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

  function openEdit(task) {
    setEditForm({
      title: task.title,
      priority: task.priority,
      status: task.status,
      deadline: new Date(task.deadline).toISOString().slice(0, 10),
    })
    setEditTask(task)
  }

  async function saveEdit(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.patch(`/api/tasks/${editTask.id}`, {
        title: editForm.title,
        priority: editForm.priority,
        status: editForm.status,
        deadline: editForm.deadline,
      })
      setTasks((list) => list.map((x) => (x.id === editTask.id ? data.task : x)))
      setEditTask(null)
    } catch (err) {
      const d = err.response?.data
      setError((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not update task')
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

  async function enroll(code) {
    setError('')
    try {
      const { data } = await api.post('/api/courses', { code })
      setCourses((list) => [data.course, ...list])
      setShowEnroll(false)
      setEnrollSearch('')
    } catch (err) {
      setError(err.response?.data?.error || 'Could not enroll')
    }
  }

  function openRequest() {
    setReqForm({ code: enrollSearch.trim(), title: '', instructorName: '', note: '' })
    setReqOpen(true)
  }

  async function submitRequest(e) {
    e.preventDefault()
    setError('')
    try {
      await api.post('/api/courses/requests', {
        code: reqForm.code,
        title: reqForm.title,
        instructorName: reqForm.instructorName || undefined,
        note: reqForm.note || undefined,
      })
      setReqOpen(false)
      setShowEnroll(false)
      setEnrollSearch('')
      setNotice('✓ Request sent to the admin. Track it on the Requests page.')
    } catch (err) {
      const d = err.response?.data
      setError((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not send request')
    }
  }

  function taskMatches(task) {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    let matchesFilter = true
    if (filter === 'In progress') matchesFilter = task.status === 'IN_PROGRESS'
    if (filter === 'High priority') matchesFilter = task.priority === 'HIGH'
    return matchesSearch && matchesFilter
  }

  const enrolledCodes = new Set(courses.map((c) => c.code))
  const q = enrollSearch.trim().toLowerCase()
  const availableCatalog = catalog.filter(
    (c) =>
      !enrolledCodes.has(c.code) &&
      (q === '' || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)),
  )
  const notFound = q !== '' && availableCatalog.length === 0

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
            <button key={f} className={`filter-pill ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f}
            </button>
          ))}
          <span className="toolbar-spacer" />
          <button className="btn-cta" onClick={() => { setShowEnroll((s) => !s); setShowAdd(false); setNotice('') }}>
            {showEnroll ? 'Cancel' : '+ Add course'}
          </button>
          <button
            className="btn-cta"
            disabled={courses.length === 0}
            title={courses.length === 0 ? 'Enroll in a course first' : ''}
            onClick={() => { setShowAdd((s) => !s); setShowEnroll(false) }}
          >
            {showAdd ? 'Cancel' : '+ Add task'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}
        {notice && <div className="export-success">{notice}</div>}

        {showEnroll && (
          <div className="enroll-panel">
            <input
              className="task-search-input"
              placeholder="Search the course catalog…"
              value={enrollSearch}
              onChange={(e) => setEnrollSearch(e.target.value)}
              autoFocus
            />
            <div className="enroll-list">
              {availableCatalog.map((c) => (
                <div key={c.id} className="enroll-row">
                  <span>{c.code} · {c.title}{c.instructorName ? ` · ${c.instructorName}` : ''}</span>
                  <button className="btn-cta" onClick={() => enroll(c.code)}>Enroll</button>
                </div>
              ))}
              {notFound && (
                <div className="enroll-empty">
                  <span>“{enrollSearch.trim()}” isn’t in the catalog.</span>
                  <button className="btn-cta" onClick={openRequest}>Request admin to add</button>
                </div>
              )}
              {!notFound && availableCatalog.length === 0 && (
                <div className="enroll-empty"><span>You’re enrolled in every catalog course. 🎉</span></div>
              )}
            </div>
          </div>
        )}

        {showAdd && (
          <form className="add-task-form" onSubmit={addTask}>
            <select required value={form.courseId} onChange={(e) => setForm({ ...form, courseId: e.target.value })}>
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>{c.code} · {c.title}</option>
              ))}
            </select>
            <input required placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Med</option>
              <option value="HIGH">High</option>
            </select>
            <input required type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
            <button className="btn-cta" type="submit">Save</button>
          </form>
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="muted">You’re not enrolled in any courses yet. Click “+ Add course” to enroll from the catalog.</p>
        ) : (
          courses.map((course, i) => {
            const hasFilter = search !== '' || filter !== 'All'
            const courseTasks = tasks.filter((t) => t.courseId === course.id).filter(taskMatches)
            if (hasFilter && courseTasks.length === 0) return null

            return (
              <div key={course.id} className="course-group">
                <div className="course-group-title">
                  <span className={`course-dot ${COURSE_COLORS[i % COURSE_COLORS.length]}`} />
                  {course.code} · {course.title}
                </div>

                {courseTasks.length === 0 ? (
                  <p className="muted" style={{ paddingLeft: 8 }}>No tasks yet.</p>
                ) : courseTasks.map((task) => {
                  const pLabel = PRIORITY_LABEL[task.priority]
                  const sLabel = STATUS_LABEL[task.status]
                  const done = task.status === 'COMPLETE'
                  return (
                    <div key={task.id} className="task-row">
                      <input type="checkbox" className="task-check" checked={done} onChange={() => toggleDone(task)} />
                      <span className={`task-title ${done ? 'done' : ''}`}>{task.title}</span>
                      <span className={`priority-badge ${priorityClass(pLabel)}`}>{pLabel}</span>
                      <span className={`task-status ${statusClass(sLabel)}`}>{sLabel}</span>
                      <span className="task-due">{done ? '✓ Done' : `Due ${weekday(task.deadline)}`}</span>
                      <span className="task-icons">
                        <button className="task-icon-btn" title="Edit" onClick={() => openEdit(task)}>✏️</button>
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

      {reqOpen && (
        <div className="modal-overlay" onClick={() => setReqOpen(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submitRequest}>
            <div className="modal-icon">📩</div>
            <h3 className="modal-title">Request a new course</h3>
            <p className="modal-text">The admin will review this and add it to the catalog if approved.</p>
            <div className="settings-field">
              <label>Course code</label>
              <input required value={reqForm.code} onChange={(e) => setReqForm({ ...reqForm, code: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Course title</label>
              <input required value={reqForm.title} onChange={(e) => setReqForm({ ...reqForm, title: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Instructor (optional)</label>
              <input value={reqForm.instructorName} onChange={(e) => setReqForm({ ...reqForm, instructorName: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Note to admin (optional)</label>
              <input value={reqForm.note} onChange={(e) => setReqForm({ ...reqForm, note: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setReqOpen(false)}>Cancel</button>
              <button type="submit" className="btn-cta">Send request</button>
            </div>
          </form>
        </div>
      )}

      {editTask && (
        <div className="modal-overlay" onClick={() => setEditTask(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={saveEdit}>
            <div className="modal-icon">✏️</div>
            <h3 className="modal-title">Edit task</h3>
            <div className="settings-field">
              <label>Title</label>
              <input required value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
            </div>
            <div className="settings-field">
              <label>Difficulty / priority</label>
              <select value={editForm.priority} onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Med</option>
                <option value="HIGH">High</option>
              </select>
            </div>
            <div className="settings-field">
              <label>Progress</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option value="NOT_STARTED">Not started</option>
                <option value="IN_PROGRESS">In progress</option>
                <option value="COMPLETE">Done</option>
                <option value="SKIPPED">Skipped</option>
              </select>
            </div>
            <div className="settings-field">
              <label>Deadline</label>
              <input required type="date" value={editForm.deadline} onChange={(e) => setEditForm({ ...editForm, deadline: e.target.value })} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn-outline" onClick={() => setEditTask(null)}>Cancel</button>
              <button type="submit" className="btn-cta">Save changes</button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}

export default CoursesTasksView
