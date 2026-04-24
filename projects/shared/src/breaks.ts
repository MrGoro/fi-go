import { differenceInMilliseconds } from 'date-fns';
import {
  BREAK_RULE_1_THRESHOLD_MINUTES,
  BREAK_RULE_1_REQUIRED_MINUTES,
  BREAK_RULE_2_THRESHOLD_MINUTES,
  BREAK_RULE_2_REQUIRED_MINUTES,
} from './constants';
import type { BreakRecord } from './types';

/**
 * The legally required minimum break for a given gross-work-time. Follows the
 * German ArbZG sliding scale: anwachsend 6:00→6:30 (max 30 min), konstant bis
 * 9:00, anwachsend 9:00→9:15 (max 45 min), konstant darüber.
 */
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

// Total minutes from a list of manually recorded breaks
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
