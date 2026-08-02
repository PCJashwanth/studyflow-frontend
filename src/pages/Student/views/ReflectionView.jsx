import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

function ReflectionView() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState([])

  useEffect(() => {
    api
      .get('/api/schedule/reflection')
      .then((r) => setData(r.data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load reflection'))
      .finally(() => setLoading(false))
  }, [])

  function accept(id) {
    setAccepted((prev) => (prev.includes(id) ? prev : [...prev, id]))
  }

  return (
    <>
      <PageHeader title="Weekly Reflection" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}
        {loading ? (
          <p className="muted">Loading…</p>
        ) : !data ? null : (
          <>
            <p className="section-sub">Your week in review</p>

            <div className="stats-row">
              <div className="stat-card green-accent">
                <span className="stat-value">{data.stats.completed} / {data.stats.total}</span>
                <span className="stat-label">Tasks completed</span>
              </div>
              <div className="stat-card orange-accent">
                <span className="stat-value">{data.stats.slipped}</span>
                <span className="stat-label">Past deadline</span>
              </div>
              <div className="stat-card blue-accent">
                <span className="stat-value">{data.stats.completionRate}%</span>
                <span className="stat-label">Completion rate</span>
              </div>
            </div>

            <div className="content-grid">
              <div className="panel">
                <h2 className="panel-title">Patterns we noticed</h2>
                <ul className="insight-list">
                  {data.patterns.map((p, i) => (
                    <li key={i} className="insight-item">
                      <span className="insight-emoji">{p.emoji}</span>
                      {p.text}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="panel">
                <h2 className="panel-title">Suggestions for next week</h2>
                {data.suggestions.map((s) => {
                  const isAccepted = accepted.includes(s.id)
                  return (
                    <div key={s.id} className="suggestion-item">
                      {s.text}
                      <button
                        className={`btn-small ${isAccepted ? 'accepted' : ''}`}
                        onClick={() => accept(s.id)}
                        disabled={isAccepted}
                      >
                        {isAccepted ? '✓ Accepted' : 'Accept'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}

export default ReflectionView
