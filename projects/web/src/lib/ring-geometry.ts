/* Ring-Geometrie
   240°-Bogen, offen unten. 0° = 12 Uhr, CW positiv. */

export const RING = {
  CX: 170,
  CY: 170,
  RADIUS: 128,
  STROKE: 22,
  START_ANGLE: -120,
  END_ANGLE: 120,
} as const;

export const RING_SWEEP = RING.END_ANGLE - RING.START_ANGLE; // 240°

export const RING_COLORS = {
  track:     'var(--ring-track)',
  work:      'hsl(var(--primary))',
  over:      'hsl(var(--ring-over))',
  limit:     'hsl(var(--ring-limit))',
  break:     'oklch(0.78 0.115 22)',
  breakHint: 'oklch(0.90 0.060 22)',
} as const;

// Each round linecap adds STROKE/2 ≈ 11px beyond the endpoint (≈ 4.9° at RADIUS=128).
// Two caps together consume ~10°, so anything shorter vanishes. Enforce a minimum of
// 14° centred on the true midpoint so short pauses stay readable.
export const MIN_BREAK_SWEEP = 14;

export const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

export const pointOnRing = (deg: number, r: number = RING.RADIUS) => {
  const rad = (deg * Math.PI) / 180;
  return { x: RING.CX + r * Math.sin(rad), y: RING.CY - r * Math.cos(rad) };
};

export const arcPath = (startDeg: number, endDeg: number, r: number = RING.RADIUS) => {
  if (endDeg - startDeg < 0.02) return '';
  const s = pointOnRing(startDeg, r);
  const e = pointOnRing(endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
};

export const minToAngle = (min: number, maxMin: number) =>
  RING.START_ANGLE + (Math.max(0, Math.min(maxMin, min)) / maxMin) * RING_SWEEP;

export const expandBreak = (a0: number, a1: number): [number, number] => {
  if (a1 - a0 >= MIN_BREAK_SWEEP) return [a0, a1];
  const mid = (a0 + a1) / 2;
  return [mid - MIN_BREAK_SWEEP / 2, mid + MIN_BREAK_SWEEP / 2];
};

/**
 * Precomputed full-track arc path. Both endpoints land at y=234
 * (= CY - RADIUS·cos(120°) = 170 + 64). Used by skeletons.
 */
export const RING_TRACK_PATH = arcPath(RING.START_ANGLE, RING.END_ANGLE);
