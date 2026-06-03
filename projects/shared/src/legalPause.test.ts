import { describe, it, expect } from 'vitest';
import { calculateLegalPauseStatus, calculateLegalPauseZones } from './legalPause';

const H = (h: number, m = 0) => h * 60 + m;

describe('calculateLegalPauseZones', () => {
  it('exposes the two ArbZG pause zones for a fresh day', () => {
    const zones = calculateLegalPauseZones(0, 0);
    expect(zones).toHaveLength(2);
    // Zone 1: gross 6:00 → 6:30 (30 min). Zone 2: gross 9:30 → 9:45 (15 min on top).
    expect(zones[0]).toMatchObject({ startMin: H(6), endMin: H(6, 30), potentialMin: 30, activeMin: 0 });
    expect(zones[1]).toMatchObject({ startMin: H(9, 30), endMin: H(9, 45), potentialMin: 15, activeMin: 0 });
  });
});

describe('calculateLegalPauseStatus', () => {
  it('announces the next pending pause before any zone is reached', () => {
    // 5h worked → zone 1 (at 6h) is still 60 min away, would deduct 30 min.
    expect(calculateLegalPauseStatus(H(5), 0)).toMatchObject({
      isRunning: false,
      nextPauseIn: 60,
      nextPauseDeduction: 30,
    });
  });

  it('reports a running deduction while inside zone 1', () => {
    // 6h15 worked, no manual break → 15 min into the zone-1 deduction.
    const status = calculateLegalPauseStatus(H(6, 15), 0);
    expect(status.isRunning).toBe(true);
    expect(status.minsRemaining).toBe(15);
  });

  it('points to zone 2 once zone 1 is fully past', () => {
    // 8h20 worked → between the zones; zone 2 (gross 9:30) is next.
    expect(calculateLegalPauseStatus(H(8, 20), 0)).toMatchObject({
      isRunning: false,
      nextPauseIn: H(9, 30) - H(8, 20),
      nextPauseDeduction: 15,
    });
  });

  it('returns an idle status once all zones are exhausted', () => {
    expect(calculateLegalPauseStatus(H(10), 0)).toEqual({
      isRunning: false,
      minsRemaining: 0,
      nextPauseIn: null,
      nextPauseDeduction: null,
    });
  });
});
