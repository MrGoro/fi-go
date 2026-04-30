// Domain constants for work-time, legal breaks and workday-status thresholds.
// All values are in minutes unless suffixed otherwise.

// ── Work time ────────────────────────────────────────────────────────────────
export const WORK_TIME_TARGET_MINUTES = 7 * 60 + 36; // 456 — daily target work time (Soll)
export const MAX_WORK_LIMIT_MINUTES   = 10 * 60;     // 600 — legal upper limit per workday

// ── Break rules (German ArbZG) ───────────────────────────────────────────────
// Once gross-work-time crosses each threshold, the corresponding break duration
// is legally required and gets deducted from net-work-time.
export const BREAK_RULE_1_THRESHOLD_MINUTES = 6 * 60; // 360
export const BREAK_RULE_1_REQUIRED_MINUTES  = 30;     // legal break duration once threshold 1 is reached

export const BREAK_RULE_2_THRESHOLD_MINUTES = 9 * 60; // 540
export const BREAK_RULE_2_REQUIRED_MINUTES  = 45;     // legal break duration once threshold 2 is reached

// ── Workday-status thresholds ────────────────────────────────────────────────
// Used to choose contextual messages in the timer UI.
export const WORKDAY_TEN_HOUR_URGENT_MINUTES   = 10;  // ≤ this min to 10h → urgent
export const WORKDAY_TEN_HOUR_WARN_MINUTES     = 30;  // ≤ this min to 10h → warning
export const WORKDAY_DAILY_MAX_URGENT_MINUTES  = 10;  // ≤ this min to daily max → urgent
export const WORKDAY_DAILY_MAX_WARN_MINUTES    = 30;  // ≤ this min to daily max → warning
export const WORKDAY_PAUSE_URGENT_MINUTES    = 5;   // next pause in ≤ this → urgent
export const WORKDAY_PAUSE_WARN_MINUTES      = 15;  // next pause in ≤ this → warning
export const WORKDAY_PAUSE_TIP_MINUTES       = 30;  // next pause in ≤ this → info nudge
export const WORKDAY_FEIERABEND_NOW_MINUTES  = 5;   // ≤ this to Feierabend → success
export const WORKDAY_FEIERABEND_NEAR_MINUTES = 15;  // ≤ this to Feierabend → info
export const WORKDAY_SOLL_REACHED_MINUTES    = 5;   // overtime ∈ [0, this] → success "Soll geschafft"
export const WORKDAY_OVERTIME_STRONG_MINUTES = 60;  // overtime > this → success
