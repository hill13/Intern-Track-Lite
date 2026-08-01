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