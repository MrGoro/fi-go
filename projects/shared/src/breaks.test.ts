import { describe, it, expect } from 'vitest';
import {
  calculateLegalMinimumBreakMinutes,
  calculateManualBreaksMinutes,
  calculateAppliedBreakMinutes,
} from './breaks';
import type { BreakRecord } from './types';

describe('calculateLegalMinimumBreakMinutes (ArbZG sliding scale)', () => {
  it('requires no break under 6h gross', () => {
    expect(calculateLegalMinimumBreakMinutes(0)).toBe(0);
    expect(calculateLegalMinimumBreakMinutes(5 * 60)).toBe(0);
    expect(calculateLegalMinimumBreakMinutes(6 * 60)).toBe(0); // exactly 6h: still 0
  });

  it('slides 6:00 → 6:30 up to the 30 min zone-1 break', () => {
    expect(calculateLegalMinimumBreakMinutes(6 * 60 + 15)).toBe(15);
    expect(calculateLegalMinimumBreakMinutes(6 * 60 + 30)).toBe(30);
  });

  it('holds 30 min through the flat zone up to 9:30 gross (= 9h net)', () => {
    expect(calculateLegalMinimumBreakMinutes(8 * 60)).toBe(30);
    expect(calculateLegalMinimumBreakMinutes(9 * 60 + 30)).toBe(30);
  });

  it('slides 9:30 → 9:45 up to the 45 min zone-2 break', () => {
    expect(calculateLegalMinimumBreakMinutes(9 * 60 + 45)).toBe(45);
    expect(calculateLegalMinimumBreakMinutes(10 * 60)).toBe(45);
  });
});

describe('calculateManualBreaksMinutes', () => {
  it('sums completed break durations', () => {
    const breaks: BreakRecord[] = [
      { start: new Date('2026-06-03T12:00:00'), end: new Date('2026-06-03T12:30:00') },
      { start: new Date('2026-06-03T15:00:00'), end: new Date('2026-06-03T15:10:00') },
    ];
    expect(calculateManualBreaksMinutes(breaks)).toBe(40);
  });

  it('adds the running live break against a fixed "now"', () => {
    const now = new Date('2026-06-03T12:20:00');
    const liveStart = new Date('2026-06-03T12:00:00');
    expect(calculateManualBreaksMinutes([], liveStart, now)).toBe(20);
  });
});

describe('calculateAppliedBreakMinutes', () => {
  it('takes the larger of legal minimum and manual breaks', () => {
    // 8h gross → legal min 30. Manual smaller → legal wins.
    expect(calculateAppliedBreakMinutes(8 * 60, 10)).toBe(30);
    // Manual larger → manual wins.
    expect(calculateAppliedBreakMinutes(8 * 60, 45)).toBe(45);
  });
});
