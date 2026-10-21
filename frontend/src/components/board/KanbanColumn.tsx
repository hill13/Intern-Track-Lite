import { useDroppable } from '@dnd-kit/core'
import type { Application, Tag } from '../../types'
import { STAGE_META, type Stage } from '../../constants'
import ApplicationCard from './ApplicationCard'

interface Props {
  stage: string
  applications: Application[]
  tags: Tag[]
  onEdit: (app: Application) => void
}

export default function KanbanColumn({ stage, applications, tags, onEdit }: Props) {
  const { setNodeRef } = useDroppable({
    id: stage,
  })

  // STAGE_META is keyed by the exact Stage union; stage prop is a loose string
  // because the caller iterates over STAGES, so cast at the lookup site.
  const meta = STAGE_META[stage as Stage]

  return (
    <div className="bg-surface border border-stone-200 rounded-xl shadow-sm p-4 w-64 flex-shrink-0">
      {/* Column header: colored dot anchors the stage identity, count chip
          mirrors the stage palette for an at-a-glance pipeline shape read. */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${meta.dot}`} aria-hidden />
          <h2 className="text-xs font-semibold text-stone-700 uppercase tracking-wider">
            {stage.charAt(0).toUpperCase() + stage.slice(1)}
          </h2>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${meta.bg} ${meta.text} ${meta.border}`}>
          {applications.length}
        </span>
      </div>
      <div ref={setNodeRef} className="min-h-20 flex flex-col gap-2">
        {applications.length === 0 ? (
          <div className="text-xs text-stone-400 italic py-2">No applications</div>
        ) : (
          applications.map((app) => (
            <ApplicationCard key={app.id} application={app} tags={tags} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  )
}
