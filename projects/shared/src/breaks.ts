import { differenceInMilliseconds } from 'date-fns';
import {
  BREAK_RULE_1_THRESHOLD_MINUTES,
  BREAK_RULE_1_REQUIRED_MINUTES,
  BREAK_RULE_2_THRESHOLD_MINUTES,
  BREAK_RULE_2_REQUIRED_MINUTES,
} from './constants';
import type { BreakRecord } from './types';

// Zone 2 gross threshold: BREAK_RULE_2_THRESHOLD_MINUTES is a NET threshold (9h net).
// Since zone 1 already deducts BREAK_RULE_1_REQUIRED_MINUTES (30 min), the corresponding
// gross threshold is 540 + 30 = 570 min gross. This ensures zone 2 triggers at 9h net,
// not 9h gross (which would be only 8h30m net — 30 min too early per ArbZG §4).
const BREAK_RULE_2_GROSS_THRESHOLD =
  BREAK_RULE_2_THRESHOLD_MINUTES + BREAK_RULE_1_REQUIRED_MINUTES; // 570

/**
 * The legally required minimum break for a given gross-work-time. Follows the
 * German ArbZG sliding scale: anwachsend 6:00→6:30 (max 30 min), konstant bis
 * 9:30 gross (=9:00 netto), anwachsend 9:30→9:45 (max 45 min), konstant darüber.
 *
 * Zone 2 is anchored at 9h NET (BREAK_RULE_2_THRESHOLD_MINUTES = 540). Its gross
 * threshold is 570 (= 540 + 30 min zone-1 break), so that net time is frozen at
 * 540 during the zone-2 window rather than at 510.
 */
export function calculateLegalMinimumBreakMinutes(grossWorkMinutes: number): number {
  if (grossWorkMinutes <= BREAK_RULE_1_THRESHOLD_MINUTES) {
    return 0; // Under 6 hours: no mandatory break
  }

  if (grossWorkMinutes <= BREAK_RULE_1_THRESHOLD_MINUTES + BREAK_RULE_1_REQUIRED_MINUTES) {
    // Sliding scale gross 6:00→6:30, net frozen at 6:00
    return grossWorkMinutes - BREAK_RULE_1_THRESHOLD_MINUTES;
  }

  if (grossWorkMinutes <= BREAK_RULE_2_GROSS_THRESHOLD) {
    // Flat zone gross 6:30→9:30 (= net 6:00→9:00)
    return BREAK_RULE_1_REQUIRED_MINUTES; // 30 mins
  }

  if (grossWorkMinutes <= BREAK_RULE_2_GROSS_THRESHOLD + (BREAK_RULE_2_REQUIRED_MINUTES - BREAK_RULE_1_REQUIRED_MINUTES)) {
    // Sliding scale gross 9:30→9:45, net frozen at 9:00
    return BREAK_RULE_1_REQUIRED_MINUTES + (grossWorkMinutes - BREAK_RULE_2_GROSS_THRESHOLD);
  }

  // Over gross 9:45 (net 9:00)
  return BREAK_RULE_2_REQUIRED_MINUTES; // 45 mins
}

// Total minutes from a list of manually recorded breaks
export function calculateManualBreaksMinutes(breaks: BreakRecord[]): number {
  const millis = breaks.reduce((acc, brk) => acc + Math.max(0, differenceInMilliseconds(brk.end, brk.start)), 0);
  return Math.floor(millis / 60000);
}

/**
 * The break that will be applied (= max of legal minimum and manual) for a given
 * gross-work-time. Pass the current grossMin for the live value.
 */
export function calculateAppliedBreakMinutes(grossWorkMinutes: number, manualBreaksMinutes: number): number {
  const legalBreaksMinutes = calculateLegalMinimumBreakMinutes(grossWorkMinutes);
  return Math.max(legalBreaksMinutes, manualBreaksMinutes);
}

/**
 * Returns the gross-work-time (wall-clock minutes since start) at which a given
 * net-work-time target is reached. Correctly accounts for zone-1 and zone-2 breaks.
 *
 * gross = net + appliedBreak(gross) — this inverts that relation analytically:
 *   - net ≤ BREAK_RULE_2_THRESHOLD_MINUTES (540): break = max(30, manual)
 *   - net >  BREAK_RULE_2_THRESHOLD_MINUTES (540): break = max(45, manual)
 */
export function grossTimeForNetTarget(netMin: number, manualBreaksMin: number): number {
  const breakAmount = netMin <= BREAK_RULE_2_THRESHOLD_MINUTES
    ? Math.max(BREAK_RULE_1_REQUIRED_MINUTES, manualBreaksMin)
    : Math.max(BREAK_RULE_2_REQUIRED_MINUTES, manualBreaksMin);
  return netMin + breakAmount;
}
