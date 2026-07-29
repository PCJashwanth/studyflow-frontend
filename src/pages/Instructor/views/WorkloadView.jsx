import { useState, useEffect } from 'react'
import InstructorHeader from './InstructorHeader'
import { api } from '../../../lib/api'

function WorkloadView() {
  const [courses, setCourses] = useState([])
  const [byCourse, setByCourse] = useState({})
  const [course, setCourse] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/api/instructor/workload')
      .then((r) => {
        setCourses(r.data.courses)
        setByCourse(r.data.byCourse)
        setCourse(r.data.courses[0] || '')
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load workload'))
      .finally(() => setLoading(false))
  }, [])

  const data = byCourse[course]
  const maxHours = data ? Math.max(...data.weeks.map((w) => w.hours), data.recommendedMax, 1) : 1

  return (
    <>
      <InstructorHeader title="Workload Over Time" courses={courses} course={course} onCourseChange={setCourse} />
      <div className="page-body">
        <div className="info-banner">
          ℹ️ Anonymized aggregate data — no individual student is identifiable.
        </div>

        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !data ? (
          <p className="muted">No courses assigned to you yet.</p>
        ) : (
          <>
            <div className="stats-row">
              <div className="stat-card orange-accent">
                <span className="stat-value">{data.heaviestWeek}</span>
                <span className="stat-label">{data.heaviestNote}</span>
              </div>
              <div className="stat-card blue-accent">
                <span className="stat-value">{data.peakLoad} h</span>
                <span className="stat-label">Peak weekly study load</span>
              </div>
              <div className="stat-card green-accent">
                <span className="stat-value">{data.termAverage} h</span>
                <span className="stat-label">Term average per week</span>
              </div>
            </div>

            <div className="panel">
              <h2 className="panel-title">Estimated weekly study load across the term</h2>

              <div className="workload-plot">
                <div className="max-line" style={{ bottom: `${(data.recommendedMax / maxHours) * 100}%` }}>
                  <span className="max-line-label">recommended max</span>
                </div>

                {data.weeks.map((w) => {
                  const heightPct = (w.hours / maxHours) * 100
                  return (
                    <div className="bar-col" key={w.label}>
                      {w.marker && (
                        <span className="bar-marker" style={{ bottom: `${heightPct}%` }}>
                          {w.marker}
                          <span className="marker-dot" />
                        </span>
                      )}
                      <div
                        className={`bar ${w.peak ? 'peak' : ''}`}
                        style={{ height: `${heightPct}%` }}
                        title={`${w.hours}h`}
                      />
                    </div>
                  )
                })}
              </div>

              <div className="week-labels">
                {data.weeks.map((w) => (
                  <span key={w.label}>{w.label}</span>
                ))}
              </div>
            </div>

            <div className="warn-banner">⚠️ {data.insight}</div>
          </>
        )}
      </div>
    </>
  )
}

export default WorkloadView
