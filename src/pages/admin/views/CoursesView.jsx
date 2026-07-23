import { useState } from 'react'
import AdminHeader from './AdminHeader'

// Sample courses (no backend yet). `status` is 'Active' or 'Archived'.
const sampleCourses = [
  { id: 1, code: 'CSCI 2110', title: 'Data Structures & Algorithms', instructor: 'Dr. D. Okafor', students: 148, term: 'Fall 2026', status: 'Active' },
  { id: 2, code: 'CSCI 5709', title: 'Advanced Web Development', instructor: 'Prof. A. Lee', students: 92, term: 'Fall 2026', status: 'Active' },
  { id: 3, code: 'CSCI 5409', title: 'Cloud Computing', instructor: 'Dr. M. Singh', students: 110, term: 'Fall 2026', status: 'Active' },
  { id: 4, code: 'CSCI 6515', title: 'Machine Learning', instructor: 'Dr. R. Patel', students: 76, term: 'Fall 2026', status: 'Active' },
  { id: 5, code: 'CSCI 5408', title: 'Data Management & Warehousing', instructor: 'Prof. K. Brown', students: 64, term: 'Winter 2026', status: 'Archived' },
  { id: 6, code: 'CSCI 5308', title: 'Advanced Software Development', instructor: 'Dr. J. Wu', students: 88, term: 'Winter 2026', status: 'Archived' },
]

function CoursesView() {
  const [courses, setCourses] = useState(sampleCourses)
  const [search, setSearch] = useState('')

  // Archive / Restore just flips the status locally for now.
  function toggleArchive(id) {
    setCourses((list) =>
      list.map((c) =>
        c.id === id ? { ...c, status: c.status === 'Active' ? 'Archived' : 'Active' } : c,
      ),
    )
  }

  const visible = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <>
      <AdminHeader title="Course Catalog" />
      <div className="page-body">
        <div className="admin-toolbar">
          <input
            type="text"
            placeholder="Search courses..."
            className="user-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="add-user-btn">+ Add course</button>
        </div>

        <div className="panel admin-panel">
          <table className="user-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Term</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => {
                const isActive = c.status === 'Active'
                return (
                  <tr key={c.id}>
                    <td><strong>{c.code}</strong></td>
                    <td>{c.title}</td>
                    <td>{c.instructor}</td>
                    <td>{c.students}</td>
                    <td>{c.term}</td>
                    <td>
                      <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="table-action">Edit</button>
                      {/* Active courses can be archived; archived ones can be restored */}
                      <button className="table-action" onClick={() => toggleArchive(c.id)}>
                        {isActive ? 'Archive' : 'Restore'}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default CoursesView
