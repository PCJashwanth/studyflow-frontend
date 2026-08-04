import { useState, useEffect } from 'react'
import InstructorHeader from './InstructorHeader'
import { api } from '../../../lib/api'

const statusClass = (s) => s.toLowerCase()
const blankForm = { title: '', type: 'ASSIGNMENT', deadline: '', effortHours: 2, priority: 'MEDIUM' }

function AssignmentsView() {
  const [courses, setCourses] = useState([])
  const [byCourse, setByCourse] = useState({})
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(blankForm)

  function load(keepCourse) {
    return api
      .get('/api/instructor/assignments')
      .then((r) => {
        setCourses(r.data.courses)
        setByCourse(r.data.byCourse)
        setCourse((prev) => (keepCourse && prev) || r.data.courses[0] || '')
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load assignments'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load(false)
  }, [])

  async function addAssignment(e) {
    e.preventDefault()
    setError('')
    setNotice('')
    try {
      const { data } = await api.post('/api/instructor/assignments', {
        code: course,
        title: form.title,
        type: form.type,
        deadline: form.deadline,
        effortHours: Number(form.effortHours),
        priority: form.priority,
      })
      setShowAdd(false)
      setForm(blankForm)
      setNotice(`✓ "${data.assignment.title}" created — sent to ${data.fannedOutTo} enrolled student${data.fannedOutTo === 1 ? '' : 's'}.`)
      await load(true)
    } catch (err) {
      const d = err.response?.data
      setError((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not create assignment')
    }
  }

  const data = byCourse[course]

  return (
    <>
      <InstructorHeader title="Assignments" courses={courses} course={course} onCourseChange={setCourse} />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {notice && <div className="export-success">{notice}</div>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !data ? (
          <p className="muted">No courses assigned to you yet. Ask an admin to assign you a course.</p>
        ) : (
          <>
            <div className="assign-subhead">
              <span className="assign-note-text">{data.note}</span>
              <button className="btn-cta" onClick={() => { setShowAdd((s) => !s); setNotice('') }}>
                {showAdd ? 'Cancel' : '+ Add assignment'}
              </button>
            </div>

            {showAdd && (
              <form className="add-task-form" onSubmit={addAssignment}>
                <span className="muted" style={{ alignSelf: 'center' }}>For <strong>{course}</strong>:</span>
                <input required placeholder="Assignment title" value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {['ASSIGNMENT', 'READING', 'EXAM', 'PRESENTATION', 'PROJECT', 'OTHER'].map((t) => (
                    <option key={t} value={t}>{t[0] + t.slice(1).toLowerCase()}</option>
                  ))}
                </select>
                <input required type="date" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                <input type="number" min="1" max="100" style={{ width: 90 }} placeholder="Hours" value={form.effortHours}
                  onChange={(e) => setForm({ ...form, effortHours: e.target.value })} />
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Med</option>
                  <option value="HIGH">High</option>
                </select>
                <button className="btn-cta" type="submit">Create &amp; assign</button>
              </form>
            )}

            <div className="panel assign-card">
              <table className="user-table">
                <thead>
                  <tr>
                    <th>Assignment</th>
                    <th>Due date</th>
                    <th>Est. hours</th>
                    <th>Avg completion</th>
                    <th>On-time %</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.length === 0 ? (
                    <tr><td colSpan="7" className="audit-none">No assignments yet — create one above.</td></tr>
                  ) : (
                    data.rows.map((a) => (
                      <tr key={a.id} className={a.warning ? 'assign-row-warning' : ''}>
                        <td>
                          <div className="assign-name">{a.name}</div>
                          {a.warning && <div className="assign-warning-note">⚠️ {a.warning}</div>}
                        </td>
                        <td>{a.due}</td>
                        <td>{a.hours} h</td>
                        <td className={a.avgCompletion !== null && a.avgCompletion < 70 ? 'text-danger' : ''}>
                          {a.avgCompletion === null ? '—' : `${a.avgCompletion}%`}
                        </td>
                        <td className={a.onTime !== null && a.onTime < 70 ? 'text-danger' : ''}>
                          {a.onTime === null ? '—' : `${a.onTime}%`}
                        </td>
                        <td>
                          <span className={`assign-status ${statusClass(a.status)}`}>{a.status}</span>
                        </td>
                        <td>
                          <button className="table-action" disabled title="Coming soon">Edit</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default AssignmentsView
