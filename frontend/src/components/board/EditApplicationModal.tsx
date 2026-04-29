import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateApplication, deleteApplication } from '../../api/applications'
import type { Application, Tag } from '../../types'

interface Props {
  app: Application | null
  onClose: () => void
  tags: Tag[]
}

const STAGES = ['wishlist', 'applied', 'screening', 'interview', 'offer', 'rejected', 'withdrawn']
const SOURCES = ['linkedin', 'handshake', 'indeed', 'company_website', 'referral', 'other']

export default function EditApplicationModal({ app, onClose, tags }: Props) {
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

  // Sync form fields whenever a different card is clicked
  // useState only initializes once on mount, so useEffect is needed to re-fill
  // when app changes (e.g. user clicks a different card without closing the modal)
  useEffect(() => {
    if (app) {
      setCompanyName(app.company_name)
      setRoleTitle(app.role_title)
      setStage(app.stage)
      setSource(app.source)
      setNotes(app.notes ?? '')
      setJobUrl(app.job_url ?? '')
      setSelectedTagIds(app.tag_ids)
    }
  }, [app])

  // All hooks must be called before any conditional return
  if (!app) return null

  const toggleTag = (tagId: number) => {
    setSelectedTagIds(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await updateApplication(app.id, {
        company_name: companyName,
        role_title: roleTitle,
        stage,
        source,
        notes: notes || undefined,
        job_url: jobUrl || undefined,
        tag_ids: selectedTagIds,
      })
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose()
    } catch {
      setError('Failed to update application')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this application?')) return
    setLoading(true)
    try {
      await deleteApplication(app.id)
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      onClose()
    } catch {
      setError('Failed to delete application')
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
        <h2 className="text-lg font-semibold mb-4">Edit Application</h2>

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

          <div className="flex justify-between mt-2">
            {/* Delete on the left — destructive action separated from save/cancel */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm rounded border border-red-300 text-red-500 hover:bg-red-50 disabled:opacity-50"
            >
              Delete
            </button>
            <div className="flex gap-2">
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
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
