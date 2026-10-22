import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { createApplication, updateApplication } from '../../api/applications'
import type { Tag } from '../../types'
import { STAGES } from '../../constants'
import TagSection from './TagSection'

interface Props {
  isOpen: boolean
  onClose: () => void
  tags: Tag[]
}

const SOURCES = ['linkedin', 'handshake', 'indeed', 'company_website', 'referral', 'other']

export default function AddApplicationModal({ isOpen, onClose, tags }: Props) {
  const [companyName, setCompanyName] = useState('')
  const [roleTitle, setRoleTitle] = useState('')
  const [stage, setStage] = useState('applied')
  const [source, setSource] = useState('linkedin')
  const [notes, setNotes] = useState('')
  const [jobUrl, setJobUrl] = useState('')
  const [reminderDate, setReminderDate] = useState('')  // empty = let backend default to applied_date + 7d
  const [selectedTagIds, setSelectedTagIds] = useState<number[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const queryClient = useQueryClient()

  const formatSource = (s: string) =>
    s.replace(/_/g, ' ').replace(/^./, c => c.toUpperCase())

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
        reminder_date: reminderDate || undefined,  // undefined → backend applies applied_date + 7d default
      })
      // Attach tags via PATCH if any were selected
      if (selectedTagIds.length > 0) {
        await updateApplication(newApp.id, { tag_ids: selectedTagIds })
      }
      // Tell React Query the applications cache is stale — triggers a refetch
      await queryClient.invalidateQueries({ queryKey: ['applications'] })
      // Reset form for next use
      setCompanyName(''); setRoleTitle(''); setStage('applied')
      setSource('linkedin'); setNotes(''); setJobUrl(''); setReminderDate('')
      setSelectedTagIds([])
      onClose()
    } catch {
      setError('Failed to create application')
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
        <h2 className="text-lg font-semibold tracking-tight text-stone-900 mb-4">Add Application</h2>

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
            <span className="text-[10px] text-stone-400">Defaults to applied date + 7 days if blank</span>
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

          <div className="flex justify-end gap-2 mt-3">
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
              {loading ? 'Adding...' : 'Add Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
