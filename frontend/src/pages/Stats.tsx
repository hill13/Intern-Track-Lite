// Stats.tsx — Stats dashboard page
// Two independent React Query hooks (useByStage / useVelocity) feed two charts.
// Each section owns its own loading / error / empty / success state, so a slow
// or failed velocity fetch never hides the by-stage chart and vice versa.
// Zero-fill (sparse -> dense) lives in utils/stats and is memoized per data ref.

import { useMemo } from 'react'
import { useByStage, useVelocity } from '../hooks/useStats'
import { zeroFillStages, zeroFillVelocity } from '../utils/stats'
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

// Format "2026-04-27" -> "Apr 27" without UTC drift. Splitting the string and
// constructing with new Date(y, m-1, d) keeps the date in local time.
const formatWeek = (value: string) => {
  const [y, m, d] = value.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// "applied" -> "Applied" — friendlier x-axis labels
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// Shared classes for the four KPI tiles at the top of the page
const tileClass = 'bg-white rounded-lg shadow-sm p-4'
const tileLabelClass = 'text-xs font-medium uppercase tracking-wide text-gray-500'
const tileValueClass = 'text-3xl font-semibold text-gray-900 mt-1'

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

  // Derive KPI tile values from denseStages — no extra API calls needed.
  const totals = useMemo(() => {
    const byStage = Object.fromEntries(denseStages.map(({ stage, count }) => [stage, count]))
    return {
      total: denseStages.reduce((sum, s) => sum + s.count, 0),
      applied: byStage.applied ?? 0,
      interviews: (byStage.screening ?? 0) + (byStage.interview ?? 0),
      offers: byStage.offer ?? 0,
    }
  }, [denseStages])

  const renderStageChart = () => {
    if (stageIsLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>
    if (stageIsError) {
      return (
        <div className="p-4 text-red-600 bg-red-50 rounded">
          Failed to load stages.{' '}
          <button
            onClick={() => refetchStage()}
            disabled={stageIsFetching}
            className="ml-2 px-3 py-1 text-sm rounded border border-red-300 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {stageIsFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )
    }
    if (stageData!.length === 0)
      return <div className="p-8 text-center text-gray-500">No applications yet.</div>

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={denseStages} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="stage" tickFormatter={capitalize} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12 }} />
          <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  const renderVelocityChart = () => {
    if (velocityIsLoading) return <div className="p-8 text-center text-gray-500">Loading...</div>
    if (velocityIsError) {
      return (
        <div className="p-4 text-red-600 bg-red-50 rounded">
          Failed to load velocity.{' '}
          <button
            onClick={() => refetchVelocity()}
            disabled={velocityIsFetching}
            className="ml-2 px-3 py-1 text-sm rounded border border-red-300 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {velocityIsFetching ? 'Retrying...' : 'Retry'}
          </button>
        </div>
      )
    }
    if (velocityData!.length === 0)
      return <div className="p-8 text-center text-gray-500">No applications in the last 12 weeks.</div>

    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={denseVelocity} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey="week_start" tickFormatter={formatWeek} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={{ stroke: '#e5e7eb' }} tickLine={false} />
          <YAxis allowDecimals={false} tick={{ fill: '#4b5563', fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 6, border: '1px solid #e5e7eb', fontSize: 12 }} labelFormatter={(label) => formatWeek(String(label))} />
          <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: '#3b82f6' }} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Page header — title + subtitle */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto flex items-center px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Stats</h1>
            <p className="text-sm text-gray-500 mt-0.5">Your application pipeline at a glance.</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full px-6 py-6 space-y-6">
        {/* KPI tiles — derived from denseStages, no extra fetch */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className={tileClass}>
            <div className={tileLabelClass}>Total</div>
            <div className={tileValueClass}>{totals.total}</div>
          </div>
          <div className={tileClass}>
            <div className={tileLabelClass}>Applied</div>
            <div className={tileValueClass}>{totals.applied}</div>
          </div>
          <div className={tileClass}>
            <div className={tileLabelClass}>Interviews</div>
            <div className={tileValueClass}>{totals.interviews}</div>
          </div>
          <div className={tileClass}>
            <div className={tileLabelClass}>Offers</div>
            <div className={tileValueClass}>{totals.offers}</div>
          </div>
        </div>

        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">By Stage</h2>
          {renderStageChart()}
        </section>
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-4">Velocity — Last 12 Weeks</h2>
          {renderVelocityChart()}
        </section>
      </div>
    </div>
  )
}
