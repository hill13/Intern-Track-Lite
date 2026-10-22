import { useState, useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { updateApplication, deleteApplication } from '../../api/applications'
import type { Application, Tag } from '../../types'
import { STAGES } from '../../constants'
import TagSection from './TagSection'

interface Props {
  app: Application | null
  onClose: () => void
  tags: Tag[]
}

const SOURCES = ['linkedin', 'handshake', 'indeed', 'company_website', 'referral', 'other']

export default function EditApplicationModal({ app, onClose, tags }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [stage, setStage] = useState('applied')
  const [source, setSource] = useState('linkedin')
  const [notes, setNotes] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [reminderDate, setReminderDate] = useState('')  // YYYY-MM-DD string; '' means no reminder
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  const formatSource = (s: string) =>
    s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())

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
      setReminderDate(app.reminder_date ?? '')   // snake_case to match backend
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
        // Empty string → send null so the backend clears the reminder.
        // (undefined would omit the field entirely, leaving the existing DB value.)
        reminder_date: reminderDate || null,
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

  // Reused across every form field — stone border + teal focus ring.
  const inputCls = "border border-stone-300 rounded-md px-3 py-2 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-colors"
  const labelCls = "text-xs font-medium text-stone-600 flex flex-col gap-1"

  return (
    // Overlay — clicking outside the modal closes it
    <div
      className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal box — stop click from bubbling to overlay */}
      <div
        className="bg-surface border border-stone-200 rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-4">Edit Application</h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">

          <label className={labelCls}>
            Company name
            <input
              className={inputCls}
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              required
            />
          </label>

          <label className={labelCls}>
            Role title
            <input
              className={inputCls}
              value={roleTitle}
              onChange={e => setRoleTitle(e.target.value)}
              required
            />
          </label>

          <label className={labelCls}>
            Stage
            <select
              className={inputCls}
              value={stage}
              onChange={e => setStage(e.target.value)}
            >
              {STAGES.map(s => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </label>

          <label className={labelCls}>
            Source
            <select
              className={inputCls}
              value={source}
              onChange={e => setSource(e.target.value)}
            >
              {SOURCES.map(s => (
                <option key={s} value={s}>{formatSource(s)}</option>
              ))}
            </select>
          </label>

          <label className={labelCls}>
            Reminder date
            <input
              type="date"
              className={inputCls}
              value={reminderDate}
              onChange={e => setReminderDate(e.target.value)}
            />
            <span className="text-[10px] text-stone-400">Clear the field to remove the reminder</span>
          </label>

          <label className={labelCls}>
            Job URL (Optional)
            <input
              className={inputCls}
              value={jobUrl}
              onChange={e => setJobUrl(e.target.value)}
            />
          </label>

          <label className={labelCls}>
            Notes (Optional)
            <textarea
              className={inputCls}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
            />
          </label>

          {/* Tag selector */}
          <TagSection selectedTagIds={selectedTagIds} tags={tags} onToggle={toggleTag} />

          {error && (
            <div className="bg-danger-soft border border-danger-border text-danger text-sm px-3 py-2 rounded-md">
              {error}
            </div>
          )}

          <div className="flex justify-between mt-3">
            {/* Delete on the left — destructive action separated from save/cancel */}
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium rounded-md border border-danger-border text-danger hover:bg-danger-soft disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Delete
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-md border border-stone-300 text-stone-700 hover:bg-sunken transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium rounded-md bg-accent text-white hover:bg-accent-strong disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
