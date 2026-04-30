import {
  BREAK_RULE_1_THRESHOLD_MINUTES,
  BREAK_RULE_1_REQUIRED_MINUTES,
  BREAK_RULE_2_THRESHOLD_MINUTES,
  BREAK_RULE_2_REQUIRED_MINUTES,
} from './constants';
import type { LegalPauseStatus, LegalPauseZone } from './types';

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

  // Zone 2 gross threshold is BREAK_RULE_2_THRESHOLD_MINUTES (net) plus the actual
  // applied break at that point (max of zone-1 required and manual). This ensures
  // zone 2 starts at exactly 9h net regardless of how much manual break was taken.
  const z2GrossStart = BREAK_RULE_2_THRESHOLD_MINUTES + Math.max(z1Required, manualBreaksMinutes);

  const tierSpecs = [
    { startMin: BREAK_RULE_1_THRESHOLD_MINUTES, requiredMin: z1Required, manualOffset: 0 },
    { startMin: z2GrossStart,                   requiredMin: z2Required, manualOffset: z1Required },
  ];

  return tierSpecs.map(spec => {
    const manualCoverageMin = Math.min(spec.requiredMin, Math.max(0, manualBreaksMinutes - spec.manualOffset));
    const accumulatedMin    = Math.min(Math.max(0, grossWorkMinutes - spec.startMin), spec.requiredMin);
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

  // Imminent deduction: we are inside a zone but manual breaks still provide full coverage
  // (activeDeductionMin === 0). Warn once the deduction start point approaches — this
  // prevents a silent jump from "Zone N in X min" straight to "Abzug läuft".
  for (const tier of tiers) {
    if (
      grossWorkMinutes >= tier.startMin &&
      grossWorkMinutes <  tier.endMin   &&
      tier.activeDeductionMin === 0     &&
      tier.potentialMin > 0
    ) {
      // Deduction activates when accumulated > manualCoverageMin, i.e. at grossMin = startMin + manualCoverageMin + 1.
      // nextPauseIn = 0 means "starts next minute" and triggers the urgent threshold.
      const deductionStartsAt = tier.startMin + tier.manualCoverageMin;
      const minsToDeduction   = deductionStartsAt - grossWorkMinutes;
      if (minsToDeduction >= 0) {
        return { isRunning: false, minsRemaining: 0, nextPauseIn: minsToDeduction, nextPauseDeduction: tier.potentialMin };
      }
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
