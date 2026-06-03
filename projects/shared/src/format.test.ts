import { describe, it, expect } from 'vitest';
import { minutesToTimeDuration, millisToTimeDuration } from './format';

describe('minutesToTimeDuration', () => {
  it('splits positive minutes into hours/minutes', () => {
    expect(minutesToTimeDuration(90)).toEqual({ hours: 1, minutes: 30, seconds: 0, negative: false });
  });

  it('flags negative durations and reports the absolute value', () => {
    expect(minutesToTimeDuration(-75)).toEqual({ hours: 1, minutes: 15, seconds: 0, negative: true });
  });

  it('handles zero', () => {
    expect(minutesToTimeDuration(0)).toEqual({ hours: 0, minutes: 0, seconds: 0, negative: false });
  });
});

describe('millisToTimeDuration', () => {
  it('splits milliseconds into hours/minutes/seconds', () => {
    expect(millisToTimeDuration(3_661_000)).toEqual({ hours: 1, minutes: 1, seconds: 1, negative: false });
  });

  it('flags negative values', () => {
    expect(millisToTimeDuration(-1000)).toEqual({ hours: 0, minutes: 0, seconds: 1, negative: true });
  });
});
