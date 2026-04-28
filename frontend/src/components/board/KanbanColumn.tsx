// KanbanColumn.tsx — A single droppable column on the Kanban board
// useDroppable marks this column as a valid drop target.
// When a card is dropped here, DndContext fires onDragEnd with over.id = stage name.

import { useDroppable } from '@dnd-kit/core'
import type { Application, Tag } from '../../types'
import ApplicationCard from './ApplicationCard'

interface Props {
  stage: string
  applications: Application[]
  tags: Tag[]
}

export default function KanbanColumn({ stage, applications, tags }: Props) {
  const { setNodeRef } = useDroppable({
    id: stage,  // onDragEnd will see over.id === stage when a card is dropped here
  })

  return (
    <div className="bg-white rounded-lg shadow p-4 w-64 flex-shrink-0">

      {/* Column header */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        {stage.charAt(0).toUpperCase() + stage.slice(1)}
      </h2>

      {/* Drop zone — ref registered here so the card area is the droppable target */}
      <div ref={setNodeRef} className="min-h-20 flex flex-col gap-2">
        {applications.length === 0 ? (
          <div className="text-sm text-gray-400">No applications yet</div>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app.id} application={app} tags={tags} />
          ))
        )}
      </div>

    </div>
  )
}
