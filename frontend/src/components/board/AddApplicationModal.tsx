import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createApplication, updateApplication } from '../../api/applications'
import type { Tag } from '../../types'

interface Props {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
}

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
const SOURCES = ['linkedin', 'handshake', 'indeed', 'company_website', 'referral', 'other']

export default function AddApplicationModal({ isOpen, onClose, tags }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [stage, setStage] = useState('applied')
  const [source, setSource] = useState('linkedin')
  const [notes, setNotes] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  // Hooks must all be called before any conditional return
  if (!isOpen) return null

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // prevent browser page reload on submit
    setLoading(true)
    setError('')
    try {
      const newApp = await createApplication({
        company_name: companyName,
        role_title: roleTitle,
        stage,
        source,
        notes: notes || undefined,
        job_url: jobUrl || undefined,
      })
      // Attach tags via PATCH if any were selected
      if (selectedTagIds.length > 0) {
        await updateApplication(newApp.id, { tag_ids: selectedTagIds })
      }
      // Tell React Query the applications cache is stale — triggers a refetch
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      // Reset form for next use
      setCompanyName(''); setRoleTitle(''); setStage('applied')
      setSource('linkedin'); setNotes(''); setJobUrl(''); setSelectedTagIds([])
      onClose()
    } catch {
      setError('Failed to create application')
    } finally {
      setLoading(false)
    }
  }

  return (
    // Overlay — clicking outside the modal closes it
    <div
      className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      {/* Modal box — stop click from bubbling to overlay */}
      <div
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Add Application</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Company name"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            required
          />
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Role title"
            value={roleTitle}
            onChange={e => setRoleTitle(e.target.value)}
            required
          />
          <select
            className="border rounded px-3 py-2 text-sm"
            value={stage}
            onChange={e => setStage(e.target.value)}
          >
            {STAGES.map(s => (
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
          <select
            className="border rounded px-3 py-2 text-sm"
            value={source}
            onChange={e => setSource(e.target.value)}
          >
            {SOURCES.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <input
            className="border rounded px-3 py-2 text-sm"
            placeholder="Job URL (optional)"
            value={jobUrl}
            onChange={e => setJobUrl(e.target.value)}
          />
          <textarea
            className="border rounded px-3 py-2 text-sm"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
          />

          {/* Tag selector */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  style={{ backgroundColor: tag.color }}
                  className={`text-xs text-white px-2 py-0.5 rounded-full transition-opacity ${
                    selectedTagIds.includes(tag.id) ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded border hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
