//NOT WIRED WITH THE BACKEND YET!
function PageHeader({ title }) {
  return (
    <header className="page-header">
      <h1 className="page-title">{title}</h1>
      <div className="search-box">
        <span>🔍</span>
        <input type="text" placeholder="Search..." />
      </div>
    </header>
  )
}

export default PageHeader
