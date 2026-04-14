// KanbanColumn.tsx — A single column on the Kanban board
// Receives the stage name as a prop and renders a header + list of cards.
// Static placeholder cards for now — will receive real applications once API is wired up.

interface Props {
  stage: string
}

export default function KanbanColumn({ stage }: Props) {
  return (
    // Each column is a fixed-width card with a light background
    <div className="bg-white rounded-lg shadow p-4 w-64 flex-shrink-0">

      {/* Column header — capitalize first letter of stage name */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        {stage.charAt(0).toUpperCase() + stage.slice(1)}
        {/*    ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
              charAt(0) = first letter, toUpperCase() = capitalize it
              slice(1)  = rest of the string unchanged
              e.g. "wishlist" → "Wishlist"                          */}
      </h2>

      {/* Placeholder card — will be replaced by real ApplicationCard components */}
      <div className="bg-gray-50 border rounded p-3 text-sm text-gray-400">
        No applications yet
      </div>

    </div>
  )
}
