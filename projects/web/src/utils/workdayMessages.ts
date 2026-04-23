// ─── Thresholds — adjust here ────────────────────────────────────────────────
const TEN_HOUR_MINUTES       = 600;
const TEN_HOUR_URGENT_MIN    = 10;   // ≤ this → urgent warning
const TEN_HOUR_WARN_MIN      = 30;   // ≤ this → normal warning

const PAUSE_URGENT_MIN       = 5;    // next pause in ≤ this → urgent nudge
const PAUSE_WARN_MIN         = 15;   // next pause in ≤ this → warning

const FEIERABEND_SUCCESS_MIN = 5;    // ≤ this to Feierabend → success
const FEIERABEND_INFO_MIN    = 15;
const FEIERABEND_NEAR_MIN    = 30;

const OVERTIME_SUCCESS_MIN   = 60;   // > this overtime → "starker Tag"
const EARLY_DAY_MIN          = 30;   // > this min to Feierabend → "Früher Vogel"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function pad(n: number): string {
  return String(Math.floor(Math.abs(n))).padStart(2, '0');
}

function formatHHMM(minutesSinceMidnight: number): string {
  const total = ((Math.floor(minutesSinceMidnight) % 1440) + 1440) % 1440;
  return `${pad(total / 60)}:${pad(total % 60)}`;
}

function toNowMin(currentTime: Date | number): number {
  if (currentTime instanceof Date) {
    return currentTime.getHours() * 60 + currentTime.getMinutes();
  }
  return Math.floor(currentTime);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface WorkdayMessageParams {
  currentTime: Date | number;
  sollMinutes: number;
  workedMinutes: number;
  legalPauseRunning: boolean;
  legalPauseMinsRemaining: number;
  nextLegalPauseIn: number | null;
  nextLegalPauseDeduction: number | null;
}

export interface WorkdayMessage {
  text: string;
  type: 'info' | 'warning' | 'success' | 'urgent';
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Returns a contextual status message for the current workday state.
 *
 * Pause-related fields come from calculateLegalPauseStatus() in @figo/shared —
 * no legal-pause thresholds are duplicated here.
 */
export function getWorkdayMessage({
  currentTime,
  sollMinutes,
  workedMinutes,
  legalPauseRunning,
  legalPauseMinsRemaining,
  nextLegalPauseIn,
  nextLegalPauseDeduction,
}: WorkdayMessageParams): WorkdayMessage | null {
  const nowMin              = toNowMin(currentTime);
  const minutesToTen        = TEN_HOUR_MINUTES - workedMinutes;
  const minutesToFeierabend = sollMinutes - workedMinutes;
  const overtimeMin         = -minutesToFeierabend;

  // 1. 10h limit already exceeded
  if (minutesToTen < 0) {
    return {
      text: `10h-Grenze seit ${Math.floor(-minutesToTen)} Min. überschritten – du solltest jetzt Feierabend machen`,
      type: 'urgent',
    };
  }

  // 2. 10h limit in ≤ 10 min
  if (minutesToTen <= TEN_HOUR_URGENT_MIN) {
    return {
      text: `Noch ${Math.floor(minutesToTen)} Minuten bis zur gesetzlichen 10h-Grenze`,
      type: 'urgent',
    };
  }

  // 3. 10h limit in ≤ 30 min
  if (minutesToTen <= TEN_HOUR_WARN_MIN) {
    const tenAtMin = nowMin + minutesToTen;
    return {
      text: `Noch ${Math.floor(minutesToTen)} Minuten bis zur 10h-Grenze (um ${formatHHMM(tenAtMin)})`,
      type: 'warning',
    };
  }

  // 4. Legal pause actively running — minsRemaining comes directly from shared logic
  if (legalPauseRunning) {
    return {
      text: `Gesetzliche Pause wird gerade abgezogen (noch ${legalPauseMinsRemaining} Min.)`,
      type: 'urgent',
    };
  }

  // 5. Next pause in ≤ 5 min — leaving now avoids the deduction
  if (nextLegalPauseIn !== null && nextLegalPauseIn <= PAUSE_URGENT_MIN) {
    return {
      text: `In ${Math.ceil(nextLegalPauseIn)} Minuten erfolgt ein Pausenabzug – jetzt Feierabend spart dir ${nextLegalPauseDeduction} Minuten`,
      type: 'warning',
    };
  }

  // 6. Next pause in ≤ 15 min
  if (nextLegalPauseIn !== null && nextLegalPauseIn <= PAUSE_WARN_MIN) {
    return {
      text: `In ${Math.ceil(nextLegalPauseIn)} Minuten wird ein gesetzlicher Pausenabzug fällig`,
      type: 'warning',
    };
  }

  // 7. Feierabend in ≤ 5 min
  if (minutesToFeierabend > 0 && minutesToFeierabend <= FEIERABEND_SUCCESS_MIN) {
    return {
      text: `Feierabend in ${Math.floor(minutesToFeierabend)} Minuten 🎉`,
      type: 'success',
    };
  }

  // 8. Feierabend in ≤ 15 min
  if (minutesToFeierabend > 0 && minutesToFeierabend <= FEIERABEND_INFO_MIN) {
    return {
      text: `Noch ${Math.floor(minutesToFeierabend)} Minuten bis Feierabend`,
      type: 'info',
    };
  }

  // 9. Feierabend in ≤ 30 min
  if (minutesToFeierabend > 0 && minutesToFeierabend <= FEIERABEND_NEAR_MIN) {
    return {
      text: `Noch ${Math.floor(minutesToFeierabend)} Minuten – gleich geschafft`,
      type: 'info',
    };
  }

  // 10. More than 60 min overtime
  if (overtimeMin > OVERTIME_SUCCESS_MIN) {
    const h = Math.floor(overtimeMin / 60);
    const m = Math.floor(overtimeMin % 60);
    return {
      text: `Starker Tag – ${h}:${pad(m)} Std. über Soll`,
      type: 'success',
    };
  }

  // 11. Any overtime > 0
  if (overtimeMin > 0) {
    return {
      text: `Du machst Überstunden – +${Math.floor(overtimeMin)} Minuten über Soll`,
      type: 'info',
    };
  }

  // Early in the day — more than 30 min still to go
  if (minutesToFeierabend > EARLY_DAY_MIN) {
    return {
      text: `Früher Vogel – du baust einen Puffer auf`,
      type: 'info',
    };
  }

  // Negative saldo, no special state
  if (workedMinutes < sollMinutes) {
    return {
      text: `Alles läuft – weiter so 💪`,
      type: 'info',
    };
  }

  return null;
}
