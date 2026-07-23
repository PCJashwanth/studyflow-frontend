function InstructorHeader({ title, courses, course, onCourseChange }) {
  return (
    <header className="page-header">
      <div className="header-left">
        {courses ? (
          <>
            <select
              className="course-select"
              value={course}
              onChange={(e) => onCourseChange(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <h1 className="page-title">— {title}</h1>
          </>
        ) : (
          <h1 className="page-title">{title}</h1>
        )}
      </div>

      <div className="search-box">
        <span>🔍</span>
        <input type="text" placeholder="Search..." />
      </div>
    </header>
  )
}

export default InstructorHeader
