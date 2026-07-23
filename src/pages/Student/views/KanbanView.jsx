//Contains sample data now to show how it would look like when is wired with backend and has some real data
import PageHeader from './PageHeader'

// The board is three columns of cards. Each card has a course colour (the dot),
// a title, the course code, and sometimes a small note. This is static for now
// (no drag-and-drop yet) - we just show the cards.
const columns = [
  {
    name: 'To Do',
    cards: [
      { id: 1, title: 'Assign 3 — VPC + RDS', course: 'CSCI 5409', color: 'blue' },
      { id: 2, title: 'Reading quiz', course: 'CSCI 5409', color: 'blue' },
      { id: 3, title: 'Slides for demo', course: 'CSCI 5709', color: 'green' },
      { id: 4, title: 'Peer review', course: 'CSCI 6515', color: 'purple' },
    ],
  },
  {
    name: 'In Progress',
    cards: [
      { id: 5, title: 'Lab 4 build', course: 'CSCI 5709', color: 'green' },
      { id: 6, title: 'Olist report', course: 'CSCI 6515', color: 'purple' },
    ],
  },
  {
    name: 'Done',
    cards: [
      { id: 7, title: 'Proposal', course: 'CSCI 5709', color: 'green' },
      { id: 8, title: 'ERD design', course: 'CSCI 5409', color: 'blue', note: 'Lab 4 build · 13:00–15:00' },
      { id: 9, title: 'Lab 3', course: 'CSCI 5709', color: 'green', note: 'Partially completed' },
      { id: 10, title: 'Setup CI', course: 'CSCI 5709', color: 'green' },
      { id: 11, title: 'Intro reading', course: 'CSCI 6515', color: 'purple' },
    ],
  },
]

function KanbanView() {
  return (
    <>
      <PageHeader title="Kanban Board" />
      <div className="page-body">
        <div className="kanban-board">
          {columns.map((column) => (
            <div key={column.name} className="kanban-col">
              <div className="kanban-col-head">
                {column.name}
                {/* The little grey bubble showing how many cards are in this column */}
                <span className="kanban-count">{column.cards.length}</span>
              </div>

              {column.cards.map((card) => (
                <div key={card.id} className="kanban-card">
                  <div className="kanban-card-title">
                    <span className={`course-dot ${card.color}`} />
                    {card.title}
                  </div>
                  {card.note && <p className="kanban-note">{card.note}</p>}
                  <span className="kanban-course">{card.course}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

export default KanbanView
