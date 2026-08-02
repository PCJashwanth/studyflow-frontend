import { useState, useEffect } from 'react'
import PageHeader from './PageHeader'
import { api } from '../../../lib/api'

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const dayIndex = (iso) => (new Date(iso).getUTCDay() + 6) % 7
const blockHours = (b) => Math.round(((new Date(b.end) - new Date(b.start)) / 3600000) * 10) / 10
const fmtTime = (iso) =>
  new Date(iso).toLocaleString('en-US', { weekday: 'short', hour: 'numeric', timeZone: 'UTC' })

function AiScheduleView() {
  const [blocks, setBlocks] = useState([])
  const [source, setSource] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [rebalancing, setRebalancing] = useState(false)
  const [diff, setDiff] = useState(null)

  useEffect(() => {
    api
      .get('/api/schedule')
      .then((r) => {
        setBlocks(r.data.blocks)
        if (r.data.blocks.length) setSource('saved')
      })
      .catch((e) => setError(e.response?.data?.error || 'Failed to load schedule'))
      .finally(() => setLoading(false))
  }, [])

  async function generate() {
    setGenerating(true)
    setError('')
    setAccepted(false)
    setDiff(null)
    try {
      const { data } = await api.post('/api/schedule/generate', {})
      setBlocks(data.blocks)
      setSource(data.source)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not generate schedule')
    } finally {
      setGenerating(false)
    }
  }

  async function rebalance() {
    setRebalancing(true)
    setError('')
    setAccepted(false)
    try {
      const { data } = await api.post('/api/schedule/rebalance', {})
      setBlocks(data.blocks)
      setSource(data.source)
      setDiff(data.diff)
    } catch (e) {
      setError(e.response?.data?.error || 'Could not rebalance schedule')
    } finally {
      setRebalancing(false)
    }
  }

  const totalHours = Math.round(blocks.reduce((s, b) => s + blockHours(b), 0) * 10) / 10
  const week = DAY_NAMES.map((day, i) => ({ day, blocks: blocks.filter((b) => dayIndex(b.start) === i) }))
  const sourceLabel = source === 'AI' ? 'AI (Groq · Llama 3.3)' : source === 'RULE' ? 'rule-based fallback' : 'saved'

  return (
    <>
      <PageHeader title="AI Study Schedule" />
      <div className="page-body">
        {error && <p className="error-text">{error}</p>}

        <div className="ai-topbar">
          <span className="ai-status">
            {blocks.length
              ? `✓ ${blocks.length} blocks · ${totalHours}h · ${sourceLabel}`
              : 'No schedule yet for this week'}
          </span>
          <div className="ai-actions">
            {blocks.length > 0 && (
              <button className="btn-outline" onClick={rebalance} disabled={rebalancing || generating}>
                {rebalancing ? 'Rebalancing…' : '↻ Rebalance'}
              </button>
            )}
            <button className="btn-outline" onClick={generate} disabled={generating || rebalancing}>
              {generating ? 'Generating…' : blocks.length ? '✦ Regenerate' : '✦ Generate'}
            </button>
            {blocks.length > 0 && (
              <button className="btn-cta" onClick={() => setAccepted(true)}>
                {accepted ? '✓ Accepted' : 'Accept schedule'}
              </button>
            )}
          </div>
        </div>

        {diff && (
          <div className="diff-panel">
            <div className="diff-summary">
              <span>
                Rebalanced — <span className="diff-added">+{diff.added.length} added</span>,{' '}
                <span className="diff-removed">−{diff.removed.length} removed</span>, {diff.kept} kept
              </span>
              <button className="diff-close" onClick={() => setDiff(null)}>✕</button>
            </div>
            {(diff.added.length > 0 || diff.removed.length > 0) && (
              <div className="diff-lists">
                {diff.added.length > 0 && (
                  <div>
                    <h4 className="diff-h">Added</h4>
                    {diff.added.map((b, i) => (
                      <div key={i} className="diff-row added">+ {b.title.replace(/^Study:\s*/, '')} · {fmtTime(b.start)}</div>
                    ))}
                  </div>
                )}
                {diff.removed.length > 0 && (
                  <div>
                    <h4 className="diff-h">Removed</h4>
                    {diff.removed.map((b, i) => (
                      <div key={i} className="diff-row removed">− {b.title.replace(/^Study:\s*/, '')} · {fmtTime(b.start)}</div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {loading ? (
          <p className="muted">Loading…</p>
        ) : blocks.length === 0 ? (
          <div className="ai-empty">
            <p className="muted">
              Generate a personalized weekly study plan from your tasks, availability, and preferences.
            </p>
            <button className="btn-cta" onClick={generate} disabled={generating}>
              {generating ? 'Generating…' : '✦ Generate this week’s schedule'}
            </button>
          </div>
        ) : (
          <div className="ai-layout">
            <div className="ai-factors-card">
              <h2 className="ai-card-title">How this was built</h2>
              <div className="factor"><div className="factor-title">🤖 Source</div><div className="factor-sub">{sourceLabel}</div></div>
              <div className="factor"><div className="factor-title">📚 Blocks</div><div className="factor-sub">{blocks.length} study blocks</div></div>
              <div className="factor"><div className="factor-title">⚡ Effort</div><div className="factor-sub">{totalHours}h planned this week</div></div>
              <div className="factor"><div className="factor-title">🕐 Inputs</div><div className="factor-sub">your tasks, availability grid &amp; study preferences</div></div>
            </div>

            <div className="ai-week-card">
              <h2 className="ai-card-title">Your generated week</h2>
              <div className="ai-week">
                {week.map((column) => (
                  <div key={column.day}>
                    <div className="ai-day-name">{column.day}</div>
                    {column.blocks.map((block) => (
                      <div key={block.id} className={`ai-block ${block.rationale ? 'has-tip' : ''}`}>
                        {block.title.replace(/^Study:\s*/, '')}
                        <span className="hrs">{blockHours(block)}h</span>
                        {block.rationale && (
                          <span className="tip">
                            <span className="tip-title">{fmtTime(block.start)} · {block.title.replace(/^Study:\s*/, '')}</span>
                            {block.rationale}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default AiScheduleView
