// KanbanColumn.tsx — A single column on the Kanban board
// Receives the stage name and a filtered list of applications for that stage.
// Renders an ApplicationCard for each application, or a placeholder if the column is empty.

import type { Application } from '../../types'
import ApplicationCard from './ApplicationCard'

interface Props {
  stage: string
  applications: Application[]
}

export default function KanbanColumn({ stage, applications }: Props) {
  return (
    <div className="bg-white rounded-lg shadow p-4 w-64 flex-shrink-0">

      {/* Column header — capitalize first letter of stage name */}
      <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">
        {stage.charAt(0).toUpperCase() + stage.slice(1)}
      </h2>

      {/* If column is empty show placeholder, otherwise render a card per application */}
      {applications.length === 0 ? (
        <div className="text-sm text-gray-400">No applications yet</div>
      ) : (
        applications.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))
      )}

    </div>
  )
}
