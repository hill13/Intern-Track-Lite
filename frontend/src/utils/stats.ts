// Pure transforms that turn the backend's SPARSE stats responses into DENSE,
// chart-ready arrays (every bucket present, missing buckets filled with 0).
// Kept out of components so they're unit-testable in isolation.

import { STAGES } from '../constants'
import type { StageCount, VelocityPoint } from '../types'

// Sparse stage counts -> one entry per stage in STAGES order, zeros included.
// Map-lookup (O(n+m)) instead of a .find() per stage (O(n*m)).
export function zeroFillStages(data: StageCount[]): StageCount[] {
  const map = new Map(data.map(d => [d.stage, d.count]))
  return STAGES.map(stage => ({ stage, count: map.get(stage) ?? 0 }))
}

// Sparse weekly counts -> 12 contiguous weeks (oldest -> newest), zeros included.
// Week buckets are anchored to MONDAY to match Postgres DATE_TRUNC('week', ...).
export function zeroFillVelocity(data: VelocityPoint[]): VelocityPoint[] {
  // --- this week's Monday ---
  const today = new Date()
  // getDay(): Sun=0..Sat=6. (getDay()+6)%7 = days back to Monday; modulo wraps
  // Sunday (0) to 6 instead of -1. Avoids a special-case branch.
  const daysBack = (today.getDay() + 6) % 7
  const thisMonday = new Date(today)            // clone — setDate mutates in place
  thisMonday.setDate(today.getDate() - daysBack)

  // --- 12 Monday labels, oldest -> newest ---
  const weeks: string[] = []
  for (let i = 11; i >= 0; i--) {
    const monday = new Date(thisMonday)          // fresh clone each pass (no aliasing)
    monday.setDate(monday.getDate() - i * 7)     // step back i weeks
    // Format from LOCAL fields. toISOString() converts to UTC and can shift the
    // date by a day depending on time-of-day + offset — silent key-mismatch bug.
    const y = monday.getFullYear()
    const m = String(monday.getMonth() + 1).padStart(2, '0')  // getMonth() is 0-indexed
    const d = String(monday.getDate()).padStart(2, '0')
    weeks.push(`${y}-${m}-${d}`)
  }

  // --- zero-fill against the sparse response ---
  const map = new Map(data.map(d => [d.week_start, d.count]))
  return weeks.map(w => ({ week_start: w, count: map.get(w) ?? 0 }))
}
