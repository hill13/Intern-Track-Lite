import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTag, deleteTag } from '../../api/tags'
import { TAG_COLORS, type TagColor } from '../../constants'
import type { Tag } from '../../types'

interface Props {
  selectedTagIds: number[]
  tags: Tag[]
  onToggle: (tagId: number) => void
}

export default function TagSection({ selectedTagIds, tags, onToggle }: Props) {
  const queryClient = useQueryClient()

  // ---- local state for the inline create form ----
  const [isCreating, setIsCreating] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState<TagColor>(TAG_COLORS[0])
  const [error, setError] = useState<string | null>(null)
  // ---- mutations ----s
  const createTagMutation = useMutation({
    mutationFn: createTag,
    // TODO: onSuccess — invalidate ['tags'], then reset form + close it

    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tags'] })

        setNewTagName('')
        setSelectedColor(TAG_COLORS[0])
        setError(null)
        setIsCreating(false)
    }
  })

  // TODO: deleteTagMutation — useMutation calling deleteTag,
  //   onSuccess invalidates BOTH ['tags'] AND ['applications']
  //   (cross-entity mutation — server cascade drops join rows,
  //   client cache doesn't know unless we tell it)
  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tags'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
    }
  })

  // ---- handlers ----
  // TODO: handleCreate
  //   1. const trimmed = newTagName.trim()
  //   2. if trimmed === '' → setError('Name required'); return
  //   3. case-insensitive dupe check against `tags`
  //      → if match: setError('Tag already exists'); return
  //   4. createTagMutation.mutate({ name: trimmed, color: selectedColor })
  const handleCreate = () => {
    const trimmed = newTagName.trim()
    if (trimmed === '') return setError('Name required')
    if (tags.some(tag => tag.name.toLowerCase() === trimmed.toLowerCase())) return setError('Tag already exists')
    createTagMutation.mutate({ name: trimmed, color: selectedColor })
  }


  // TODO: handleDelete(tag)
  //   1. window.confirm(`Delete "${tag.name}"? It will be removed from all applications.`)
  //   2. if confirmed → deleteTagMutation.mutate(tag.id)
  const handleDelete = (tag: Tag) => {
    if (window.confirm(`Delete "${tag.name}"? It will be removed from all applications.`)) {
      deleteTagMutation.mutate(tag.id)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-gray-500">Tags</label>

      <div className="flex flex-wrap gap-2 items-center">
        {tags.map(tag => (
          // `group` = Tailwind convention so children can react to parent hover.
          // `relative` = positioning context so the absolute × below anchors here.
          <span key={tag.id} className="group relative">
            <button
              type="button"
              onClick={() => onToggle(tag.id)}
              style={{ backgroundColor: tag.color }}
              className={`text-xs text-white px-2 py-0.5 rounded-full transition-opacity ${
                selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-40'
              }`}
            >
              {tag.name}
            </button>
            <button
              type="button"
              onClick={(e) => {
                // Defensive: sibling here so toggle wouldn't fire anyway, but if
                // someone later nests × inside the pill, this keeps us safe.
                e.stopPropagation()
                handleDelete(tag)
              }}
              className="absolute -top-1 -right-1 bg-gray-700 text-white rounded-full w-4 h-4 text-[10px] leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label={`Delete tag ${tag.name}`}
            >
              ×
            </button>
          </span>
        ))}

        {!isCreating && (
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="text-xs text-gray-600 border border-dashed border-gray-400 rounded-full px-2 py-0.5 hover:bg-gray-100"
          >
            + New tag
          </button>
        )}
      </div>

      {isCreating && (
        <div className="flex flex-col gap-2 p-2 border rounded bg-gray-50">
          <input
            type="text"
            value={newTagName}
            onChange={e => setNewTagName(e.target.value)}
            placeholder="Tag name"
            className="border rounded px-2 py-1 text-sm"
          />

          <div className="flex gap-1">
            {TAG_COLORS.map(color => (
              <button
                key={color}
                type="button"
                onClick={() => setSelectedColor(color)}
                style={{ backgroundColor: color }}
                className={`w-6 h-6 rounded-full ${
                  selectedColor === color ? 'ring-2 ring-offset-1 ring-gray-800' : ''
                }`}
                aria-label={`Pick color ${color}`}
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-xs">{error}</p>}

          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => {
                setIsCreating(false)
                setNewTagName('')
                setError(null)
              }}
              className="text-xs px-2 py-1 border rounded"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreate}
              className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
