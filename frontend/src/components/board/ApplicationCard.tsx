// ApplicationCard.tsx — A single draggable application card on the Kanban board
// useDraggable makes the card pick-up-able — @dnd-kit tracks its position while dragging
// and fires onDragEnd in DndContext when it's dropped.

import { useDraggable } from '@dnd-kit/core'
import type { Application } from '../../types'

interface Props {
  application: Application
}

export default function ApplicationCard({ application }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: application.id,  // unique id — DndContext uses this in onDragEnd as active.id
  })

  // transform = x/y pixel offset while dragging — moves the card visually with the cursor
  // when not dragging, transform is null so style is undefined (no inline style applied)
  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}   // registers this DOM element as the draggable target
      {...listeners}     // mouse/touch handlers that start the drag
      {...attributes}    // aria-* accessibility attributes
      style={style}      // moves the card visually while dragging
      className="bg-white border rounded p-3 shadow-sm cursor-grab hover:shadow-md transition-shadow"
    >
      <p className="font-semibold text-sm">{application.company_name}</p>
      <p className="text-sm text-gray-500">{application.role_title}</p>
      <p className="text-xs text-blue-500 mt-1">{application.source}</p>
    </div>
  )
}
