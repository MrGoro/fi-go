import { differenceInMilliseconds } from 'date-fns';
import {
  WORK_TIME_TARGET_MINUTES,
  BREAK_RULE_1_THRESHOLD_MINUTES,
  BREAK_RULE_1_REQUIRED_MINUTES,
  BREAK_RULE_2_THRESHOLD_MINUTES,
  BREAK_RULE_2_REQUIRED_MINUTES,
} from './constants';
import type {
  TimeDuration,
  BreakRecord,
  LegalPauseStatus,
  LegalPauseZone,
} from './types';

export * from './constants';
export * from './types';

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

  if (grossWorkMinutes <= BREAK_RULE_1_THRESHOLD_MINUTES + BREAK_RULE_1_REQUIRED_MINUTES) {
    // Sliding scale from 6 to 6:30
    return grossWorkMinutes - BREAK_RULE_1_THRESHOLD_MINUTES;
  }

  if (grossWorkMinutes <= BREAK_RULE_2_THRESHOLD_MINUTES) {
    // Between 6:30 and 9:00
    return BREAK_RULE_1_REQUIRED_MINUTES; // 30 mins
  }

  if (grossWorkMinutes <= BREAK_RULE_2_THRESHOLD_MINUTES + (BREAK_RULE_2_REQUIRED_MINUTES - BREAK_RULE_1_REQUIRED_MINUTES)) {
    // Sliding scale from 9:00 to 9:15
    return BREAK_RULE_1_REQUIRED_MINUTES + (grossWorkMinutes - BREAK_RULE_2_THRESHOLD_MINUTES);
  }

  // Over 9:15
  return BREAK_RULE_2_REQUIRED_MINUTES; // 45 mins
}

// Calculate the total manual breaks from a list of BreakRecords
export function calculateManualBreaksMinutes(breaks: BreakRecord[]): number {
  const millis = breaks.reduce((acc, brk) => acc + Math.max(0, differenceInMilliseconds(brk.end, brk.start)), 0);
  return Math.floor(millis / 60000);
}

/**
 * The break that will be applied (= max of legal minimum and manual) for a given
 * gross-work-time. Pass the current grossMin for the live value, or a future anchor
 * (target or 10h-limit) to project what the break would be at that point.
 */
export function calculateAppliedBreakMinutes(workMinutes: number, manualBreaksMinutes: number): number {
  const legalBreaksMinutes = calculateLegalMinimumBreakMinutes(workMinutes);
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

interface PauseTier {
  startMin: number;
  endMin: number;
  requiredMin: number;
  manualCoverageMin: number;
  potentialMin: number;
  accumulatedMin: number;
  activeDeductionMin: number;
}

function buildPauseTiers(grossWorkMinutes: number, manualBreaksMinutes: number): PauseTier[] {
  const z1Required = BREAK_RULE_1_REQUIRED_MINUTES;                                  // 30
  const z2Required = BREAK_RULE_2_REQUIRED_MINUTES - BREAK_RULE_1_REQUIRED_MINUTES; // 15
  const tierSpecs = [
    { startMin: BREAK_RULE_1_THRESHOLD_MINUTES, requiredMin: z1Required, manualOffset: 0 },
    { startMin: BREAK_RULE_2_THRESHOLD_MINUTES, requiredMin: z2Required, manualOffset: z1Required },
  ];

  return tierSpecs.map(spec => {
    const manualCoverageMin  = Math.min(spec.requiredMin, Math.max(0, manualBreaksMinutes - spec.manualOffset));
    const accumulatedMin     = Math.min(Math.max(0, grossWorkMinutes - spec.startMin), spec.requiredMin);
    return {
      startMin:           spec.startMin,
      endMin:             spec.startMin + spec.requiredMin,
      requiredMin:        spec.requiredMin,
      manualCoverageMin,
      potentialMin:       Math.max(0, spec.requiredMin - manualCoverageMin),
      accumulatedMin,
      activeDeductionMin: Math.max(0, accumulatedMin - manualCoverageMin),
    };
  });
}

/**
 * Per-zone breakdown of how much legal pause is currently deducted vs. still
 * pending. Used to render the legal-pause hints and active deductions on the ring.
 */
export function calculateLegalPauseZones(
  grossWorkMinutes: number,
  manualBreaksMinutes: number,
): LegalPauseZone[] {
  return buildPauseTiers(grossWorkMinutes, manualBreaksMinutes).map(t => ({
    startMin:     t.startMin,
    endMin:       t.endMin,
    potentialMin: t.potentialMin,
    activeMin:    t.activeDeductionMin,
  }));
}

export function calculateLegalPauseStatus(
  grossWorkMinutes: number,
  manualBreaksMinutes: number,
): LegalPauseStatus {
  const tiers = buildPauseTiers(grossWorkMinutes, manualBreaksMinutes);

  for (const tier of tiers) {
    if (grossWorkMinutes > tier.startMin && grossWorkMinutes < tier.endMin && tier.activeDeductionMin > 0) {
      return { isRunning: true, minsRemaining: Math.ceil(tier.endMin - grossWorkMinutes), nextPauseIn: null, nextPauseDeduction: null };
    }
  }

  // Earliest pending zone — handles the case where an earlier tier is fully covered
  // by manual breaks but a later one is not.
  for (const tier of tiers) {
    if (grossWorkMinutes < tier.startMin && tier.potentialMin > 0) {
      return { isRunning: false, minsRemaining: 0, nextPauseIn: tier.startMin - grossWorkMinutes, nextPauseDeduction: tier.potentialMin };
    }
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
