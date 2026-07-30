import { useState, useEffect } from 'react'
import AdminHeader from './AdminHeader'
import { api } from '../../../lib/api'

function CoursesView({ onNavigate }) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ code: '', title: '', instructorName: '', term: '' })

  useEffect(() => {
    api
      .get('/api/admin/courses')
      .then((r) => setCourses(r.data.courses))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load courses'))
      .finally(() => setLoading(false))
  }, [])

  async function toggleArchive(course) {
    setError('')
    const status = course.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE'
    try {
      const { data } = await api.patch(`/api/admin/courses/${course.id}`, { status })
      setCourses((list) => list.map((c) => (c.id === course.id ? data.course : c)))
    } catch (e) {
      setError(e.response?.data?.error || 'Could not update course')
    }
  }

  async function addCourse(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/api/admin/courses', {
        code: form.code,
        title: form.title,
        instructorName: form.instructorName || undefined,
        term: form.term || undefined,
      })
      setCourses((list) => [data.course, ...list])
      setShowAdd(false)
      setForm({ code: '', title: '', instructorName: '', term: '' })
    } catch (err) {
      const d = err.response?.data
      setError((d?.details && Object.values(d.details)[0]?.[0]) || d?.error || 'Could not add course')
    }
  }

  const visible = courses.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      (c.instructorName || '').toLowerCase().includes(search.toLowerCase()),
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
          <button className="table-action" onClick={() => onNavigate?.('Requests')}>Requests</button>
          <button className="add-user-btn" onClick={() => setShowAdd((s) => !s)}>
            {showAdd ? 'Cancel' : '+ Add course'}
          </button>
        </div>

        {error && <p className="error-text">{error}</p>}

        {showAdd && (
          <form className="add-task-form" onSubmit={addCourse}>
            <input required placeholder="Code (e.g. CSCI 5709)" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <input required placeholder="Title" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <input placeholder="Instructor" value={form.instructorName}
              onChange={(e) => setForm({ ...form, instructorName: e.target.value })} />
            <input placeholder="Term (e.g. Fall 2026)" value={form.term}
              onChange={(e) => setForm({ ...form, term: e.target.value })} />
            <button className="btn-cta" type="submit">Save</button>
          </form>
        )}

        <div className="panel admin-panel">
          {loading ? (
            <p className="muted">Loading…</p>
          ) : (
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
                  const isActive = c.status === 'ACTIVE'
                  return (
                    <tr key={c.id}>
                      <td><strong>{c.code}</strong></td>
                      <td>{c.title}</td>
                      <td>{c.instructorName || '—'}</td>
                      <td>{c.students}</td>
                      <td>{c.term}</td>
                      <td>
                        <span className={`status-badge ${isActive ? 'active' : 'inactive'}`}>
                          {isActive ? 'Active' : 'Archived'}
                        </span>
                      </td>
                      <td>
                        <button className="table-action" disabled title="Coming soon">Edit</button>
                        <button className="table-action" onClick={() => toggleArchive(c)}>
                          {isActive ? 'Archive' : 'Restore'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}

export default CoursesView
