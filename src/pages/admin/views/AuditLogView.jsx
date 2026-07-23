import { useState } from 'react'
import AdminHeader from './AdminHeader'

// Sample audit entries (no backend yet).
//   category → which filter tab it belongs to ('user' | 'course' | 'security')
//   right    → the link on the far right ('reverse' | 'review' | none)
//   color    → the actor avatar colour
const sampleEntries = [
  { id: 1, when: '2 min ago', actor: 'Admin', initials: 'AD', color: 'red', action: 'Deactivated account', affected: 'jdoe@dal.ca', category: 'user', right: 'reverse' },
  { id: 2, when: '18 min ago', actor: 'Admin', initials: 'AD', color: 'red', action: 'Changed role → Instructor', affected: 'a.lee@dal.ca', category: 'user', right: 'reverse' },
  { id: 3, when: '1 h ago', actor: 'System', initials: 'SY', color: 'grey', action: 'Analytics cohort threshold set to 10', affected: 'Platform', category: 'security', right: null },
  { id: 4, when: '3 h ago', actor: 'Dr. Okafor', initials: 'DO', color: 'purple', action: 'Rescheduled A3 deadline', affected: 'CSCI 2110', category: 'course', right: null },
  { id: 5, when: 'Today 09:14', actor: 'Admin', initials: 'AD', color: 'red', action: 'Created course', affected: 'CSCI 2110', category: 'course', right: null },
  { id: 6, when: 'Yesterday', actor: 'System', initials: 'SY', color: 'grey', action: 'Sign-in from a new device', affected: 'maya.t@dal.ca', category: 'security', right: 'review' },
  { id: 7, when: 'Mar 2', actor: 'Admin', initials: 'AD', color: 'red', action: 'Reset password', affected: 's.kumar@dal.ca', category: 'security', right: null },
]

// The filter tabs. Each maps to the categories it should show.
const filters = [
  { label: 'All', match: () => true },
  { label: 'User changes', match: (e) => e.category === 'user' },
  { label: 'Course changes', match: (e) => e.category === 'course' },
  { label: 'Security', match: (e) => e.category === 'security' },
]

function AuditLogView() {
  const [activeFilter, setActiveFilter] = useState('All')
  const [range, setRange] = useState('Last 30 days')

  const current = filters.find((f) => f.label === activeFilter)
  const visible = sampleEntries.filter(current.match)

  return (
    <>
      <AdminHeader title="Audit Log" />
      <div className="page-body">
        <div className="audit-toolbar">
          {/* Filter tabs on the left */}
          <div className="audit-filters">
            {filters.map((f) => (
              <button
                key={f.label}
                className={`filter-pill ${activeFilter === f.label ? 'active' : ''}`}
                onClick={() => setActiveFilter(f.label)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Date range on the right (visual for now — doesn't actually filter by date) */}
          <select className="course-select" value={range} onChange={(e) => setRange(e.target.value)}>
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>

        <div className="panel admin-panel">
          <table className="user-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Affected</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {visible.map((e) => (
                <tr key={e.id}>
                  <td className="audit-when">{e.when}</td>
                  <td>
                    <div className="audit-actor">
                      <div className={`table-avatar ${e.color}`}>{e.initials}</div>
                      <span>{e.actor}</span>
                    </div>
                  </td>
                  <td>{e.action}</td>
                  <td className="audit-affected">{e.affected}</td>
                  <td>
                    {/* Reverse (blue), Review (amber), or a plain dash if nothing to do */}
                    {e.right === 'reverse' && <button className="audit-action-btn reverse">Reverse</button>}
                    {e.right === 'review' && <button className="audit-action-btn review">Review</button>}
                    {!e.right && <span className="audit-none">—</span>}
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

export default AuditLogView
