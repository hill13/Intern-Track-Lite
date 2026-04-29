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
      className="bg-white border rounded p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
    >
      {/* Drag handle — listeners here so drag only starts from the grip, not the whole card.
          stopPropagation prevents the grip click from also firing onEdit. */}
      <div
        {...listeners}
        onClick={e => e.stopPropagation()}
        className="text-gray-300 hover:text-gray-500 cursor-grab mb-1 w-fit"
      >
        ⠿
      </div>
      <p className="font-semibold text-sm">{application.company_name}</p>
      <p className="text-sm text-gray-500">{application.role_title}</p>
      <p className="text-xs text-blue-500 mt-1">{application.source}</p>
      <div className="flex flex-wrap gap-1 mt-2">
        {tags
          .filter(tag => application.tag_ids.includes(tag.id))
          .map(tag => (
            <span
              key={tag.id}
              style={{ backgroundColor: tag.color }}
              className="text-xs text-white px-2 py-0.5 rounded-full"
            >
              {tag.name}
            </span>
          ))
        }
      </div>
    </div>
  )
}
