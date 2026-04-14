// Board.tsx — Kanban board page
// Renders a horizontal row of columns, one per application stage.
// Static for now — no API calls yet. We'll wire it to the backend after the layout looks right.

import KanbanColumn from '../components/board/KanbanColumn'

// All possible application stages — order here = order on the board
const STAGES = [
  'wishlist',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

export default function Board() {
  return (
    // flex = row layout, gap-4 = space between columns, overflow-x-auto = horizontal scroll on small screens
    <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
      {STAGES.map((stage) => (
        // key tells React which column is which when re-rendering
        <KanbanColumn key={stage} stage={stage} />
      ))}
    </div>
  )
}
