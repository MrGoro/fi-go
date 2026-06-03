import { describe, it, expect } from 'vitest';
import {
  calculateGrossWorkTimeMinutes,
  calculateNetWorkTimeMinutes,
  calculateSaldoMinutes,
  calculateElapsedMinutes,
} from './workTime';
import { WORK_TIME_TARGET_MINUTES } from './constants';

describe('workTime', () => {
  it('computes gross work time as whole minutes since start', () => {
    const start = new Date('2026-06-03T08:00:00');
    const now = new Date('2026-06-03T10:30:45'); // 2h30m45s
    expect(calculateGrossWorkTimeMinutes(start, now)).toBe(150);
  });

  it('never returns a negative gross time', () => {
    const start = new Date('2026-06-03T10:00:00');
    const now = new Date('2026-06-03T09:00:00');
    expect(calculateGrossWorkTimeMinutes(start, now)).toBe(0);
  });

  it('deducts applied breaks from gross to get net (floored at 0)', () => {
    expect(calculateNetWorkTimeMinutes(150, 30)).toBe(120);
    expect(calculateNetWorkTimeMinutes(20, 30)).toBe(0);
  });

  it('computes saldo relative to the daily target (456 min)', () => {
    expect(calculateSaldoMinutes(WORK_TIME_TARGET_MINUTES)).toBe(0);
    expect(calculateSaldoMinutes(WORK_TIME_TARGET_MINUTES + 60)).toBe(60); // 1h overtime
    expect(calculateSaldoMinutes(WORK_TIME_TARGET_MINUTES - 15)).toBe(-15); // under target
  });

  it('computes elapsed minutes without going negative', () => {
    const since = new Date('2026-06-03T12:00:00');
    expect(calculateElapsedMinutes(since, new Date('2026-06-03T12:45:00'))).toBe(45);
    expect(calculateElapsedMinutes(since, new Date('2026-06-03T11:00:00'))).toBe(0);
  });
});
