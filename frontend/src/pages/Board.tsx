// Board.tsx — Kanban board page
// Fetches all applications via React Query, then splits them by stage.
// Each KanbanColumn receives only the applications that belong to its stage.

import KanbanColumn from '../components/board/KanbanColumn'
import { useApplications } from '../hooks/useApplications'

const STAGES = [
  'wishlist',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
]

export default function Board() {
  const { applications, isLoading, isError } = useApplications()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load applications.</div>

  return (
    <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
      {STAGES.map((stage) => (
        <KanbanColumn
          key={stage}
          stage={stage}
          // filter all applications down to just this column's stage
          // ?? [] = fallback to empty array if applications is undefined
          applications={applications?.filter((app) => app.stage === stage) ?? []}
        />
      ))}
    </div>
  )
}
