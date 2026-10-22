// Single source of truth for application stages.
// Order here defines column order on the board AND bar order on the stats chart.
// `as const` makes this a readonly tuple of string literals (not string[]),
// so TypeScript knows the exact set of stage values, not just "some strings".
export const STAGES = [
  'wishlist',
  'applied',
  'screening',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
] as const

// Curated palette for user-created tags. Keeps the app visually coherent
// (no eye-searing yellow-on-white) and gives the create form a small,
// clickable set of dots instead of a raw color picker.
// Same `as const` trick as STAGES: readonly tuple of exact hex literals,
// not just string[].
export const TAG_COLORS = [
  '#3b82f6', // blue
  '#10b981', // emerald
  '#f59e0b', // amber
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#6b7280', // gray
] as const

// Derived union type: 'TagColor' is exactly one of the 8 hex strings above.
// If you try to assign any other string, TypeScript will refuse — the palette
// is enforced at compile time, not just by convention.
export type TagColor = (typeof TAG_COLORS)[number]

export type Stage = (typeof STAGES)[number]

// Semantic color meta per stage. Each stage reads as a soft chip:
// pale bg + saturated label text + subtle border + a solid dot for the column
// header. Hues chosen so Wishlist→Applied→Screening→Interview→Offer carries a
// warming "progression" feel, while Rejected/Withdrawn fall out quietly.
// Hardcoded Tailwind classes so the compiler can see every string statically.
export const STAGE_META: Record<Stage, {
  bg: string
  text: string
  border: string
  dot: string
}> = {
  wishlist:  { bg: 'bg-slate-50',   text: 'text-slate-700',   border: 'border-slate-200',   dot: 'bg-slate-400' },
  applied:   { bg: 'bg-teal-50',    text: 'text-teal-800',    border: 'border-teal-200',    dot: 'bg-teal-500' },
  screening: { bg: 'bg-amber-50',   text: 'text-amber-800',   border: 'border-amber-200',   dot: 'bg-amber-500' },
  interview: { bg: 'bg-violet-50',  text: 'text-violet-800',  border: 'border-violet-200',  dot: 'bg-violet-500' },
  offer:     { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200', dot: 'bg-emerald-500' },
  rejected:  { bg: 'bg-rose-50',    text: 'text-rose-700',    border: 'border-rose-200',    dot: 'bg-rose-400' },
  withdrawn: { bg: 'bg-stone-100',  text: 'text-stone-600',   border: 'border-stone-200',   dot: 'bg-stone-400' },
}