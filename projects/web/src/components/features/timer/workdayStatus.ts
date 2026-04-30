import {
  MAX_WORK_LIMIT_MINUTES,
  WORKDAY_TEN_HOUR_URGENT_MINUTES,
  WORKDAY_TEN_HOUR_WARN_MINUTES,
  WORKDAY_DAILY_MAX_URGENT_MINUTES,
  WORKDAY_DAILY_MAX_WARN_MINUTES,
  WORKDAY_PAUSE_URGENT_MINUTES,
  WORKDAY_PAUSE_WARN_MINUTES,
  WORKDAY_PAUSE_TIP_MINUTES,
  WORKDAY_FEIERABEND_NOW_MINUTES,
  WORKDAY_FEIERABEND_NEAR_MINUTES,
  WORKDAY_SOLL_REACHED_MINUTES,
  WORKDAY_OVERTIME_STRONG_MINUTES,
  calculateElapsedMinutes,
} from '@figo/shared';
import { formatBreakDuration } from '@/lib/time';

export type WorkdayMessageSeverity = 'urgent' | 'warning' | 'success' | 'info';

export interface WorkdayMessage {
  text: string;
  severity: WorkdayMessageSeverity;
}

export interface WorkdayMessageParams {
  currentTime: Date | number;
  sollMinutes: number;
  workedMinutes: number;
  legalPauseRunning: boolean;
  legalPauseMinsRemaining: number;
  nextLegalPauseIn: number | null;
  nextLegalPauseDeduction: number | null;
  /** Minutes of net work time remaining until the user-defined daily maximum. */
  minutesToDailyMax?: number | null;
  /** True when the daily maximum falls before the 10h legal limit (i.e. is actually restrictive). */
  dailyMaxBeforeTenHours?: boolean;
  /** Start time of the currently running live break, or null if none. */
  liveBreakStart?: Date | null;
}

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

/**
 * Returns a contextual status message for the current workday state.
 * Pause-related fields come from calculateLegalPauseStatus() in @figo/shared.
 */
export function getWorkdayMessage({
  currentTime,
  sollMinutes,
  workedMinutes,
  legalPauseRunning,
  legalPauseMinsRemaining,
  nextLegalPauseIn,
  nextLegalPauseDeduction,
  minutesToDailyMax,
  dailyMaxBeforeTenHours,
  liveBreakStart,
}: WorkdayMessageParams): WorkdayMessage | null {
  const nowMin              = toNowMin(currentTime);
  const minutesToTen        = MAX_WORK_LIMIT_MINUTES - workedMinutes;
  const minutesToFeierabend = sollMinutes - workedMinutes;
  const overtimeMin         = -minutesToFeierabend;

  // Tages-Maximum (user-defined, only shown when it's more restrictive than 10h limit)
  if (minutesToDailyMax != null && dailyMaxBeforeTenHours) {
    if (minutesToDailyMax < 0) {
      return {
        text: `Tages-Maximum seit ${Math.floor(-minutesToDailyMax)} Min. überschritten!`,
        severity: 'urgent',
      };
    }
    if (minutesToDailyMax <= WORKDAY_DAILY_MAX_URGENT_MINUTES) {
      return {
        text: `Noch ${Math.floor(minutesToDailyMax)} Min. bis Tages-Maximum`,
        severity: 'urgent',
      };
    }
    if (minutesToDailyMax <= WORKDAY_DAILY_MAX_WARN_MINUTES) {
      const maxAtMin = nowMin + minutesToDailyMax;
      return {
        text: `Noch ${Math.floor(minutesToDailyMax)} Min. bis Tages-Maximum (um ${formatHHMM(maxAtMin)})`,
        severity: 'warning',
      };
    }
  }

  if (minutesToTen < 0) {
    return {
      text: `10h-Grenze seit ${Math.floor(-minutesToTen)} Min. überschritten!`,
      severity: 'urgent',
    };
  }

  if (minutesToTen <= WORKDAY_TEN_HOUR_URGENT_MINUTES) {
    return {
      text: `Noch ${Math.floor(minutesToTen)} Min. bis zur gesetzlichen 10h-Grenze`,
      severity: 'urgent',
    };
  }

  if (minutesToTen <= WORKDAY_TEN_HOUR_WARN_MINUTES) {
    const tenAtMin = nowMin + minutesToTen;
    return {
      text: `Noch ${Math.floor(minutesToTen)} Min. bis zur 10h-Grenze (um ${formatHHMM(tenAtMin)})`,
      severity: 'warning',
    };
  }

  if (legalPauseRunning) {
    return {
      text: `Pausenabzug läuft – noch ${legalPauseMinsRemaining} Min.`,
      severity: 'urgent',
    };
  }

  // Open (live) break is running — suppress time-limit approach warnings
  if (liveBreakStart) {
    return {
      text: `Pause läuft – seit ${formatBreakDuration(calculateElapsedMinutes(liveBreakStart))}`,
      severity: 'warning',
    };
  }

  if (nextLegalPauseIn !== null && nextLegalPauseIn <= WORKDAY_PAUSE_URGENT_MINUTES) {
    return {
      text: `In ${Math.ceil(nextLegalPauseIn)} Min. Abzug – Feierabend spart ${nextLegalPauseDeduction} Min.`,
      severity: 'warning',
    };
  }

  if (nextLegalPauseIn !== null && nextLegalPauseIn <= WORKDAY_PAUSE_WARN_MINUTES) {
    return {
      text: `In ${Math.ceil(nextLegalPauseIn)} Min. wird ein Pausenabzug fällig`,
      severity: 'warning',
    };
  }

  if (nextLegalPauseIn !== null && nextLegalPauseIn <= WORKDAY_PAUSE_TIP_MINUTES) {
    return {
      text: `Pause in den nächsten ${Math.ceil(nextLegalPauseIn)} Min. spart ${nextLegalPauseDeduction} Min. Abzug`,
      severity: 'info',
    };
  }

  if (minutesToFeierabend > 0 && minutesToFeierabend <= WORKDAY_FEIERABEND_NOW_MINUTES) {
    return {
      text: `Feierabend in ${Math.floor(minutesToFeierabend)} Minuten`,
      severity: 'success',
    };
  }

  if (minutesToFeierabend > 0 && minutesToFeierabend <= WORKDAY_FEIERABEND_NEAR_MINUTES) {
    return {
      text: `Noch ${Math.floor(minutesToFeierabend)} Minuten bis Feierabend`,
      severity: 'info',
    };
  }

  if (overtimeMin >= 0 && overtimeMin <= WORKDAY_SOLL_REACHED_MINUTES) {
    return {
      text: `Soll-Zeit erreicht – Feierabend möglich`,
      severity: 'success',
    };
  }

  if (overtimeMin > WORKDAY_OVERTIME_STRONG_MINUTES) {
    const h = Math.floor(overtimeMin / 60);
    const m = Math.floor(overtimeMin % 60);
    return {
      text: `Starker Tag – ${h}:${pad(m)} Std. über Soll`,
      severity: 'success',
    };
  }

  if (overtimeMin > 0) {
    return {
      text: `Du machst +${Math.floor(overtimeMin)} Min. Überstunden`,
      severity: 'info',
    };
  }

  return null;
}
