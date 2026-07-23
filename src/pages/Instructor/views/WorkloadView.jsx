import { useState } from 'react'
import InstructorHeader from './InstructorHeader'
import { courses, workloadByCourse } from './sampleData'

function WorkloadView() {
  // Which course the dropdown is showing. Changing it reloads this page's data.
  const [course, setCourse] = useState(courses[0])
  const data = workloadByCourse[course]

  // The tallest thing on the chart sets the scale, so every bar height is a
  // percentage of this. We include the recommended-max line so it always fits.
  const maxHours = Math.max(...data.weeks.map((w) => w.hours), data.recommendedMax)

  return (
    <>
      <InstructorHeader
        title="Workload Over Time"
        courses={courses}
        course={course}
        onCourseChange={setCourse}
      />
      <div className="page-body">
        {/* Reassurance banner: data is aggregated, never per-student */}
        <div className="info-banner">
          ℹ️ Anonymized aggregate data — no individual student is identifiable.
        </div>

        {/* Three summary numbers */}
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

        {/* The bar chart */}
        <div className="panel">
          <h2 className="panel-title">Estimated weekly study load across the term</h2>

          <div className="workload-plot">
            {/* Dashed "recommended max" line, positioned by its share of the scale */}
            <div className="max-line" style={{ bottom: `${(data.recommendedMax / maxHours) * 100}%` }}>
              <span className="max-line-label">recommended max</span>
            </div>

            {data.weeks.map((w) => {
              const heightPct = (w.hours / maxHours) * 100
              return (
                <div className="bar-col" key={w.label}>
                  {/* Assessment label (A1, A3, Proj…) floating above the bar */}
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

          {/* Week labels under the bars */}
          <div className="week-labels">
            {data.weeks.map((w) => (
              <span key={w.label}>{w.label}</span>
            ))}
          </div>
        </div>

        {/* Suggestion banner at the bottom */}
        <div className="warn-banner">⚠️ {data.insight}</div>
      </div>
    </>
  )
}

export default WorkloadView
