import { useDraggable } from '@dnd-kit/core'
import type { Application, Tag } from '../../types'

interface Props {
  application: Application
  tags: Tag[]
  onEdit: (app: Application) => void
}

export default function ApplicationCard({ application, tags, onEdit }: Props) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: application.id,
  })

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      style={style}
      onClick={() => onEdit(application)}
      className="bg-surface border border-stone-200 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-stone-300 transition-all cursor-pointer"
    >
      {/* Drag handle — listeners here so drag only starts from the grip, not the whole card.
          stopPropagation prevents the grip click from also firing onEdit. */}
      <div
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="text-stone-300 hover:text-stone-500 cursor-grab mb-1 w-fit transition-colors"
      >
        ⠿
      </div>
      <p className="font-semibold text-sm text-stone-900 leading-tight">{application.company_name}</p>
      <p className="text-sm text-stone-500 mt-0.5">{application.role_title}</p>
      <span className="inline-block text-[10px] font-medium uppercase tracking-wide text-accent-on-soft bg-accent-soft px-2 py-0.5 rounded-full mt-2">
        {application.source.replace(/_/g, ' ')}
      </span>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags
          .filter(tag => application.tag_ids.includes(tag.id))
          .map(tag => (
            <span
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="text-xs font-medium text-white px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))
        }
      </div>
    </div>
  )
}
