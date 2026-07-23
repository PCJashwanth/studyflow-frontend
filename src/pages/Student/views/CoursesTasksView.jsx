import { useState } from 'react'
import PageHeader from './PageHeader'

// Sample data for now (there's no backend yet). Each course has a colour and
// a list of tasks. Later this will come from the API instead of being hardcoded.
const courses = [
  {
    code: 'CSCI 5709',
    name: 'Advanced Web Development',
    color: 'green',
    tasks: [
      { id: 1, title: 'Lab 4 — TenantTrails feature build', priority: 'High', status: 'In progress', due: 'Fri' },
      { id: 2, title: 'StudyFlow proposal review', priority: 'Med', status: 'Done', due: 'Done' },
    ],
  },
  {
    code: 'CSCI 5409',
    name: 'Cloud Computing',
    color: 'blue',
    tasks: [
      { id: 3, title: 'Assignment 3 — VPC + RDS lab', priority: 'High', status: 'Not started', due: 'Fri' },
      { id: 4, title: 'Reading quiz — object storage', priority: 'Low', status: 'Not started', due: 'Mon' },
    ],
  },
  {
    code: 'CSCI 6515',
    name: 'Machine Learning',
    color: 'purple',
    tasks: [
      { id: 5, title: 'Olist late-delivery — final report', priority: 'Med', status: 'In progress', due: 'Fri' },
    ],
  },
]

// Turn a priority/status word into the matching CSS class.
// The badge colours (.high/.medium/.low) are defined in App.css.
const priorityClass = (p) => ({ High: 'high', Med: 'medium', Low: 'low' }[p])
const statusClass = (s) => s.toLowerCase().replace(' ', '') // "inprogress" | "done" | "notstarted"

function CoursesTasksView() {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All') // "All" | "In progress" | "High priority"

  // Decide whether a task should be shown, based on the search box + filter pill.
  function taskMatches(task) {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase())
    let matchesFilter = true
    if (filter === 'In progress') matchesFilter = task.status === 'In progress'
    if (filter === 'High priority') matchesFilter = task.priority === 'High'
    return matchesSearch && matchesFilter
  }

  return (
    <>
      <PageHeader title="Courses & Tasks" />
      <div className="page-body">
        {/* Search + filter pills + Add task button */}
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
          {/* Not wired up yet — will open an "add task" form once the backend exists */}
          <button className="btn-cta">+ Add task</button>
        </div>

        {/* One group per course */}
        {courses.map((course) => {
          const visibleTasks = course.tasks.filter(taskMatches)
          // Hide a whole course if none of its tasks match the search/filter
          if (visibleTasks.length === 0) return null

          return (
            <div key={course.code} className="course-group">
              <div className="course-group-title">
                <span className={`course-dot ${course.color}`} />
                {course.code} · {course.name}
              </div>

              {visibleTasks.map((task) => (
                <div key={task.id} className="task-row">
                  <input type="checkbox" className="task-check" defaultChecked={task.status === 'Done'} />
                  <span className={`task-title ${task.status === 'Done' ? 'done' : ''}`}>{task.title}</span>
                  <span className={`priority-badge ${priorityClass(task.priority)}`}>{task.priority}</span>
                  <span className={`task-status ${statusClass(task.status)}`}>{task.status}</span>
                  <span className="task-due">{task.due === 'Done' ? '✓ Done' : `Due ${task.due}`}</span>
                  <span className="task-icons">
                    <button className="task-icon-btn" title="Copy link">🔗</button>
                    <button className="task-icon-btn" title="Delete">🗑️</button>
                  </span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </>
  )
}

export default CoursesTasksView
