import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { parseToTodayDate, isFutureTimeToday, formatBreakDuration } from '@/lib/time';

describe('parseToTodayDate', () => {
  it('sets the given HH:MM on today with zeroed seconds', () => {
    const d = parseToTodayDate('08:30');
    expect(d.getHours()).toBe(8);
    expect(d.getMinutes()).toBe(30);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });
});

describe('isFutureTimeToday', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(2026, 5, 3, 12, 0, 0) }); // frozen at 12:00
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('is true for a time later today', () => {
    expect(isFutureTimeToday('23:00')).toBe(true);
  });

  it('is false for a time earlier today', () => {
    expect(isFutureTimeToday('06:00')).toBe(false);
  });

  it('is false for empty input', () => {
    expect(isFutureTimeToday('')).toBe(false);
  });
});

describe('formatBreakDuration', () => {
  it('formats sub-hour durations as minutes', () => {
    expect(formatBreakDuration(30)).toBe('30 Min.');
  });

  it('formats hour+ durations as H:MM Std.', () => {
    expect(formatBreakDuration(90)).toBe('1:30 Std.');
    expect(formatBreakDuration(125)).toBe('2:05 Std.');
  });
});
