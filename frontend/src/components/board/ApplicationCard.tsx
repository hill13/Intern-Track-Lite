// ApplicationCard.tsx — A single application card on the Kanban board
// Receives a full Application object and displays company, role, and source.
// Clicking a card will later open a detail drawer (Phase 4 next steps).

import type { Application } from '../../types'

interface Props {
  application: Application
}

export default function ApplicationCard({ application }: Props) {
  return (
    <div className="bg-white border rounded p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
      {/* Company name — most prominent */}
      <p className="font-semibold text-sm">{application.company_name}</p>

      {/* Role title — secondary info */}
      <p className="text-sm text-gray-500">{application.role_title}</p>

      {/* Source — where the job was found (linkedin, handshake, etc.) */}
      <p className="text-xs text-blue-500 mt-1">{application.source}</p>
    </div>
  )
}
