import { useState } from 'react'
import InstructorHeader from './InstructorHeader'
import { courses, assignmentsByCourse } from './sampleData'

// Turn a status word into its CSS class (colours defined in App.css)
const statusClass = (s) => s.toLowerCase()

function AssignmentsView() {
  const [course, setCourse] = useState(courses[0])
  const data = assignmentsByCourse[course]

  return (
    <>
      <InstructorHeader
        title="Assignments"
        courses={courses}
        course={course}
        onCourseChange={setCourse}
      />
      <div className="page-body">
        {/* Row above the table: a short note on the left, add button on the right */}
        <div className="assign-subhead">
          <span className="assign-note-text">{data.note}</span>
          <button className="btn-cta">+ Add assignment</button>
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
              {data.rows.map((a) => (
                // The row with a `warning` gets an amber highlight
                <tr key={a.id} className={a.warning ? 'assign-row-warning' : ''}>
                  <td>
                    <div className="assign-name">{a.name}</div>
                    {a.warning && <div className="assign-warning-note">⚠️ {a.warning}</div>}
                  </td>
                  <td>{a.due}</td>
                  <td>{a.hours} h</td>
                  {/* Numbers below 70% are shown in red so problem spots stand out.
                      A dash means the assessment hasn't happened yet. */}
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
                    {/* Offer "Reschedule" on flagged rows, plain "Edit" otherwise */}
                    <button className="table-action">{a.warning ? 'Reschedule' : 'Edit'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default AssignmentsView
