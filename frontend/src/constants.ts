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
