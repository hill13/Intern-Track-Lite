// Board.tsx — Kanban board page
// Fetches all applications via React Query, splits them by stage.
// handleDragEnd does an optimistic update — moves the card in the cache immediately,
// calls the API in the background, and rolls back if the API call fails.

import { DndContext } from '@dnd-kit/core'
import { useQueryClient } from '@tanstack/react-query'
import KanbanColumn from '../components/board/KanbanColumn'
import { useApplications } from '../hooks/useApplications'
import { useTags } from '../hooks/useTags'
import { updateApplication } from '../api/applications'
import type { Application } from '../types'

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
  const { tags } = useTags()

  // useQueryClient gives us direct access to the React Query cache
  const queryClient = useQueryClient()

  if (isLoading) return <div className="p-6">Loading...</div>
  if (isError) return <div className="p-6 text-red-500">Failed to load applications.</div>

  const handleDragEnd = async (event: any) => {
    const { active, over } = event

    // Dropped outside any column — do nothing
    if (!over) return

    const applicationId = active.id as number
    const newStage = over.id as string

    // Read the current cache so we can rollback if the API call fails
    const previous = queryClient.getQueryData<Application[]>(['applications'])

    // Find the card that was dragged
    const application = previous?.find((app) => app.id === applicationId)

    // Already in this stage — no API call needed
    if (!application || application.stage === newStage) return

    // OPTIMISTIC UPDATE — move the card in the cache immediately before API responds
    // This makes the UI feel instant — the card is already in the new column
    queryClient.setQueryData<Application[]>(['applications'], (old) =>
      old?.map((app) =>
        app.id === applicationId ? { ...app, stage: newStage } : app
      ) ?? []
    )

    try {
      // Call the backend to persist the stage change
      await updateApplication(applicationId, { stage: newStage })
    } catch {
      // API failed — rollback the cache to the previous state
      // The card will snap back to its original column
      queryClient.setQueryData(['applications'], previous)
    }
  }

  return (
    <div className="flex gap-4 p-6 overflow-x-auto min-h-screen bg-gray-100">
      <DndContext onDragEnd={handleDragEnd}>
        {STAGES.map((stage) => (
          <KanbanColumn
            key={stage}
            stage={stage}
            applications={applications?.filter((app) => app.stage === stage) ?? []}
            tags={tags ?? []}
          />
        ))}
      </DndContext>
    </div>
  )
}
