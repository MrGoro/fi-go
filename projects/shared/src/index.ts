import { differenceInMilliseconds } from 'date-fns';

export const WORK_TIME_TARGET_MINUTES = 7 * 60 + 36; // 456 — daily target work time (Soll)

export const BREAK_RULE_1_THRESHOLD_MINUTES = 6 * 60; // 360
export const BREAK_RULE_1_MIN_BREAK_MINUTES = 30;

export const BREAK_RULE_2_THRESHOLD_MINUTES = 9 * 60; // 540
export const BREAK_RULE_2_MIN_BREAK_MINUTES = 45;

export const MAX_WORK_LIMIT_MINUTES = 10 * 60; // 600

// Workday-status thresholds (minutes). Used to choose contextual messages.
export const WORKDAY_TEN_HOUR_URGENT_MIN = 10;  // ≤ this min to 10h → urgent
export const WORKDAY_TEN_HOUR_WARN_MIN   = 30;  // ≤ this min to 10h → warning
export const WORKDAY_PAUSE_URGENT_MIN    = 5;   // next pause in ≤ this → urgent
export const WORKDAY_PAUSE_WARN_MIN      = 15;  // next pause in ≤ this → warning
export const WORKDAY_FEIERABEND_NOW_MIN  = 5;   // ≤ this to Feierabend → success
export const WORKDAY_FEIERABEND_NEAR_MIN = 15;  // ≤ this to Feierabend → info
export const WORKDAY_SOLL_REACHED_MIN    = 5;   // overtime ∈ [0, this] → success "Soll geschafft"
export const WORKDAY_OVERTIME_STRONG_MIN = 60;  // overtime > this → success
export const WORKDAY_PAUSE_TIP_MIN       = 30;  // next pause in ≤ this → info nudge

export interface TimeDuration {
  hours: number;
  minutes: number;
  seconds: number;
  negative: boolean;
}

export interface BreakRecord {
  start: Date;
  end: Date;
}

// Gross work time in milliseconds
export function calculateGrossWorkTimeMillis(startTime: Date, now: Date): number {
  return Math.max(0, differenceInMilliseconds(now, startTime));
}

// Gross work time in minutes
export function calculateGrossWorkTimeMinutes(startTime: Date, now: Date): number {
  return Math.floor(calculateGrossWorkTimeMillis(startTime, now) / 60000);
}

// Legal minimum break dynamically calculating based on gross time
export function calculateLegalMinimumBreakMinutes(grossWorkMinutes: number): number {
  if (grossWorkMinutes <= BREAK_RULE_1_THRESHOLD_MINUTES) {
    return 0; // Under 6 hours: no mandatory break
  }
  
  if (grossWorkMinutes <= BREAK_RULE_1_THRESHOLD_MINUTES + BREAK_RULE_1_MIN_BREAK_MINUTES) {
    // Sliding scale from 6 to 6:30
    return grossWorkMinutes - BREAK_RULE_1_THRESHOLD_MINUTES;
  }
  
  if (grossWorkMinutes <= BREAK_RULE_2_THRESHOLD_MINUTES) {
    // Between 6:30 and 9:00
    return BREAK_RULE_1_MIN_BREAK_MINUTES; // 30 mins
  }
  
  if (grossWorkMinutes <= BREAK_RULE_2_THRESHOLD_MINUTES + (BREAK_RULE_2_MIN_BREAK_MINUTES - BREAK_RULE_1_MIN_BREAK_MINUTES)) {
    // Sliding scale from 9:00 to 9:15
    return BREAK_RULE_1_MIN_BREAK_MINUTES + (grossWorkMinutes - BREAK_RULE_2_THRESHOLD_MINUTES);
  }
  
  // Over 9:15
  return BREAK_RULE_2_MIN_BREAK_MINUTES; // 45 mins
}

// Calculate the total manual breaks from a list of BreakRecords
export function calculateManualBreaksMinutes(breaks: BreakRecord[]): number {
  const millis = breaks.reduce((acc, brk) => acc + Math.max(0, differenceInMilliseconds(brk.end, brk.start)), 0);
  return Math.floor(millis / 60000);
}

// Real Break (max of legal and manual)
export function calculateAppliedBreakMinutes(grossWorkMinutes: number, manualBreaksMinutes: number): number {
  const legalBreaksMinutes = calculateLegalMinimumBreakMinutes(grossWorkMinutes);
  return Math.max(legalBreaksMinutes, manualBreaksMinutes);
}

// Get Net Time
export function calculateNetWorkTimeMinutes(grossWorkMinutes: number, appliedBreakMinutes: number): number {
  return Math.max(0, grossWorkMinutes - appliedBreakMinutes);
}

// Get Saldo
export function calculateSaldoMinutes(netWorkMinutes: number): number {
  return netWorkMinutes - WORK_TIME_TARGET_MINUTES;
}

export interface LegalPauseStatus {
  /** True while a legal pause is actively being deducted. */
  isRunning: boolean;
  /** Gross-work-minutes remaining until the active zone ends. 0 when not running. */
  minsRemaining: number;
  /** Gross-work-minutes until the next legal deduction zone starts. null if none pending. */
  nextPauseIn: number | null;
  /** Net minutes that will be deducted when the next zone completes. null when nextPauseIn is null. */
  nextPauseDeduction: number | null;
}

export function calculateLegalPauseStatus(
  grossWorkMinutes: number,
  manualBreaksMinutes: number,
): LegalPauseStatus {
  const z1Len    = BREAK_RULE_1_MIN_BREAK_MINUTES;                                   // 30
  const z2AddLen = BREAK_RULE_2_MIN_BREAK_MINUTES - BREAK_RULE_1_MIN_BREAK_MINUTES;  // 15
  const z1Start  = BREAK_RULE_1_THRESHOLD_MINUTES;                                   // 360
  const z1End    = z1Start + z1Len;                                                  // 390
  const z2Start  = BREAK_RULE_2_THRESHOLD_MINUTES;                                   // 540
  const z2End    = z2Start + z2AddLen;                                               // 555

  const manualAtTier1 = Math.min(z1Len, manualBreaksMinutes);
  const manualAtTier2 = Math.min(z2AddLen, Math.max(0, manualBreaksMinutes - z1Len));
  const z1Potential   = Math.max(0, z1Len    - manualAtTier1);
  const z2Potential   = Math.max(0, z2AddLen - manualAtTier2);

  const t1Accum = Math.min(Math.max(0, grossWorkMinutes - z1Start), z1Len);
  const legalZ1 = Math.max(0, t1Accum - manualAtTier1);
  const t2Accum = Math.min(Math.max(0, grossWorkMinutes - z2Start), z2AddLen);
  const legalZ2 = Math.max(0, t2Accum - manualAtTier2);

  if (grossWorkMinutes > z1Start && grossWorkMinutes < z1End && legalZ1 > 0) {
    return { isRunning: true, minsRemaining: Math.ceil(z1End - grossWorkMinutes), nextPauseIn: null, nextPauseDeduction: null };
  }
  if (grossWorkMinutes > z2Start && grossWorkMinutes < z2End && legalZ2 > 0) {
    return { isRunning: true, minsRemaining: Math.ceil(z2End - grossWorkMinutes), nextPauseIn: null, nextPauseDeduction: null };
  }

  // Find earliest pending zone — handles the case where z1 is fully covered by manual
  // breaks but z2 is not, even when grossWorkMinutes is still before z1Start.
  if (grossWorkMinutes < z1Start && z1Potential > 0) {
    return { isRunning: false, minsRemaining: 0, nextPauseIn: z1Start - grossWorkMinutes, nextPauseDeduction: z1Potential };
  }
  if (grossWorkMinutes < z2Start && z2Potential > 0) {
    return { isRunning: false, minsRemaining: 0, nextPauseIn: Math.max(0, z2Start - grossWorkMinutes), nextPauseDeduction: z2Potential };
  }

  return { isRunning: false, minsRemaining: 0, nextPauseIn: null, nextPauseDeduction: null };
}

// Utils to convert mills/minutes to formatted TimeDuration
export function minutesToTimeDuration(minutes: number): TimeDuration {
  const negative = minutes < 0;
  const absMinutes = Math.floor(Math.abs(minutes));
  return {
    hours: Math.floor(absMinutes / 60),
    minutes: Math.floor(absMinutes % 60),
    seconds: 0,
    negative
  };
}

export function millisToTimeDuration(millis: number): TimeDuration {
  const negative = millis < 0;
  const absMillis = Math.floor(Math.abs(millis));
  const totalSeconds = Math.floor(absMillis / 1000);
  return {
    hours: Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    negative
  };
}
