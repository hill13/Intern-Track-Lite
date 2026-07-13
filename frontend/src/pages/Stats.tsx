// Stats.tsx — Stats dashboard page
// Two independent React Query hooks (useByStage / useVelocity) feed two charts.
// Each section owns its own loading / error / empty / success state, so a slow
// or failed velocity fetch never hides the by-stage chart and vice versa.
// Zero-fill (sparse -> dense) lives in utils/stats and is memoized per data ref.

import { useMemo } from 'react'
import { useByStage, useVelocity } from '../hooks/useStats'
import { zeroFillStages, zeroFillVelocity } from '../utils/stats'
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar } from "recharts";

export default function Stats() {
  const {
    data: stageData,
    isLoading: stageIsLoading,
    isError: stageIsError,
    refetch: refetchStage,
    isFetching: stageIsFetching,
  } = useByStage()

  const {
    data: velocityData,
    isLoading: velocityIsLoading,
    isError: velocityIsError,
    refetch: refetchVelocity,
    isFetching: velocityIsFetching,
  } = useVelocity()

  // Memoize the zero-fill so it only re-runs when the underlying query data
  // changes — not on unrelated parent re-renders (hover, route, etc.).
  const denseStages = useMemo(() => zeroFillStages(stageData ?? []), [stageData])
  const denseVelocity = useMemo(() => zeroFillVelocity(velocityData ?? []), [velocityData])

  const renderStageChart = () => {
    if (stageIsLoading) return <div>Loading...</div>
    if (stageIsError) {
      return (
        <div className="text-red-500">
          Failed to load stages.{' '}
          <button
            onClick={() => refetchStage()}
            disabled={stageIsFetching}
            className="ml-2 px-2 py-0.5 text-sm rounded border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stageIsFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )
    }
    if (stageData!.length === 0) return <div>No applications yet.</div>

    return <ResponsiveContainer width="100%" height={300}>
    <BarChart data={denseStages}>
      <XAxis dataKey="stage" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="count" fill="#3b82f6" />
    </BarChart>
  </ResponsiveContainer>
  }

  const renderVelocityChart = () => {
    if (velocityIsLoading) return <div>Loading...</div>
    if (velocityIsError) {
      return (
        <div className="text-red-500">
          Failed to load velocity.{' '}
          <button
            onClick={() => refetchVelocity()}
            disabled={velocityIsFetching}
            className="ml-2 px-2 py-0.5 text-sm rounded border border-red-300 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {velocityIsFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )
    }
    if (velocityData!.length === 0) return <div>No applications in the last 12 weeks.</div>

    return <div>VelocityChart placeholder</div>
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-4">Stats</h1>
        <section className="bg-white rounded p-4 mb-6">
          <h2 className="text-lg font-medium mb-2">By Stage</h2>
          {renderStageChart()}
        </section>
        <section className="bg-white rounded p-4">
          <h2 className="text-lg font-medium mb-2">Velocity</h2>
          {renderVelocityChart()}
        </section>
      </div>
    </div>
  )
}
