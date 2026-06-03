import { describe, it, expect } from 'vitest';
import { getWorkdayMessage, type WorkdayMessageParams } from '@/components/features/timer/workdayStatus';

// Sensible defaults; each test overrides only what it exercises.
const base: WorkdayMessageParams = {
  currentTime: new Date(2026, 5, 3, 12, 0, 0),
  sollMinutes: 456,
  workedMinutes: 100,
  legalPauseRunning: false,
  legalPauseMinsRemaining: 0,
  nextLegalPauseIn: null,
  nextLegalPauseDeduction: null,
};

describe('getWorkdayMessage precedence', () => {
  it('flags the 10h legal limit being exceeded as urgent', () => {
    const msg = getWorkdayMessage({ ...base, workedMinutes: 610 });
    expect(msg?.severity).toBe('urgent');
    expect(msg?.text).toContain('10h-Grenze');
    expect(msg?.text).toContain('überschritten');
  });

  it('reports a running legal pause deduction', () => {
    const msg = getWorkdayMessage({
      ...base,
      workedMinutes: 400,
      legalPauseRunning: true,
      legalPauseMinsRemaining: 12,
    });
    expect(msg?.severity).toBe('urgent');
    expect(msg?.text).toContain('Pausenabzug läuft');
  });

  it('shows the live break running message', () => {
    const msg = getWorkdayMessage({
      ...base,
      workedMinutes: 200,
      liveBreakStart: new Date(2026, 5, 3, 11, 30, 0),
    });
    expect(msg?.severity).toBe('warning');
    expect(msg?.text).toContain('Pause läuft');
  });

  it('celebrates a strong overtime day', () => {
    const msg = getWorkdayMessage({ ...base, workedMinutes: 546 }); // +90 min over soll
    expect(msg?.severity).toBe('success');
    expect(msg?.text).toContain('Starker Tag');
  });

  it('marks the soll target as reached', () => {
    const msg = getWorkdayMessage({ ...base, workedMinutes: 456 });
    expect(msg?.severity).toBe('success');
    expect(msg?.text).toContain('Soll-Zeit erreicht');
  });

  it('returns null when nothing noteworthy is happening', () => {
    expect(getWorkdayMessage({ ...base, workedMinutes: 100 })).toBeNull();
  });
});
