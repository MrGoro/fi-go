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

export interface LegalPauseZone {
  /** Gross-work-minute where this zone starts (e.g. 360 for the 6h zone). */
  startMin: number;
  /** Gross-work-minute where this zone ends (start + tier required minutes). */
  endMin: number;
  /** Minutes the zone would still deduct after manual coverage — render as hint. */
  potentialMin: number;
  /** Minutes already deducted at the current grossWorkMinutes — render as active. */
  activeMin: number;
}
