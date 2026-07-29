import { useState, useEffect } from 'react'
import InstructorHeader from './InstructorHeader'
import { api } from '../../../lib/api'

const statusClass = (s) => s.toLowerCase()

function AssignmentsView() {
  const [courses, setCourses] = useState([])
  const [byCourse, setByCourse] = useState({})
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/instructor/assignments')
      .then((r) => {
        setCourses(r.data.courses)
        setByCourse(r.data.byCourse)
        setCourse(r.data.courses[0] || '')
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load assignments'))
      .finally(() => setLoading(false))
  }, [])

  const data = byCourse[course]

  return (
    <>
      <InstructorHeader title="Assignments" courses={courses} course={course} onCourseChange={setCourse} />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !data ? (
          <p className="muted">No courses assigned to you yet.</p>
        ) : (
          <>
            <div className="assign-subhead">
              <span className="assign-note-text">{data.note}</span>
              <button className="btn-cta" disabled title="Coming soon">+ Add assignment</button>
            </div>

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
                    <tr><td colSpan="7" className="audit-none">No assignments.</td></tr>
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
                          <button className="table-action" disabled title="Coming soon">
                            {a.warning ? 'Reschedule' : 'Edit'}
                          </button>
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
