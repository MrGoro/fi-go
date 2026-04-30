import { useEffect, useState } from 'react';
import { addMinutes } from 'date-fns';
import type { BreakRecord } from '@figo/shared';
import {
  calculateGrossWorkTimeMinutes,
  calculateManualBreaksMinutes,
  calculateAppliedBreakMinutes,
  calculateNetWorkTimeMinutes,
  calculateSaldoMinutes,
  calculateLegalPauseStatus,
  calculateLegalPauseZones,
  minutesToTimeDuration,
  WORK_TIME_TARGET_MINUTES,
  MAX_WORK_LIMIT_MINUTES,
} from '@figo/shared';
import { RING, minToAngle } from '@/lib/ring-geometry';
import { buildSegments, placeInZone, trimTotal, type Interval, type Seg } from '@/lib/break-placement';
import { getWorkdayMessage, type WorkdayMessage } from '@/components/features/timer/workdayStatus';

export interface BreakHoverItem {
  start: number;
  end: number;
  kind: 'manual' | 'legal';
  wallStart: Date;
  wallEnd: Date;
}

export interface TimerCalculations {
  // Zeiten in Minuten
  grossMin: number;
  netMin: number;
  saldoMin: number;
  manualBreaksMin: number;
  appliedBreaksMin: number;
  // Ring-Skala
  ringMaxMin: number;
  // Ring-Content
  segments: Seg[];
  hintSlots: Interval[];
  breakHoverItems: BreakHoverItem[];
  // Marker
  sollAngle: number;
  tenAngle: number;
  finishTime: Date;
  tenLimitTime: Date;
  dailyMaxAngle?: number;
  dailyMaxLimitTime?: Date;
  // Saldo-Anzeige
  saldoText: string;
  isOvertime: boolean;
  // Kontext-Nachricht
  workdayMsg: WorkdayMessage | null;
}

/**
 * Liest Startzeit + Pausen, tickert pro Sekunde, und liefert den kompletten
 * abgeleiteten Zustand für den Timer-Ring (Segmente, Winkel, Saldo,
 * kontextuelle Nachricht). Reine Berechnung, keine Darstellung.
 */
export function useTimerCalculations(startTime: Date, breaks: BreakRecord[], maxOvertimeMinutes?: number | null): TimerCalculations {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Grundgrößen ───────────────────────────────────────────────────────
  const grossMin         = calculateGrossWorkTimeMinutes(startTime, now);
  const manualBreaksMin  = calculateManualBreaksMinutes(breaks);
  const appliedBreaksMin = calculateAppliedBreakMinutes(grossMin, manualBreaksMin);
  const netMin           = calculateNetWorkTimeMinutes(grossMin, appliedBreaksMin);
  const saldoMin         = calculateSaldoMinutes(netMin);

  // Wall-clock Anker — projizierter Break am Soll- bzw. 10h-Anker
  const sollBreakMin     = calculateAppliedBreakMinutes(WORK_TIME_TARGET_MINUTES, manualBreaksMin);
  const tenBreakMin      = calculateAppliedBreakMinutes(MAX_WORK_LIMIT_MINUTES,  manualBreaksMin);
  const finishTime       = addMinutes(startTime, WORK_TIME_TARGET_MINUTES + sollBreakMin);
  const tenLimitTime     = addMinutes(startTime, MAX_WORK_LIMIT_MINUTES + tenBreakMin);

  // Ring-Skala: 0 bis 10h-Grenze in Wall-Minutes seit Start
  const ringMaxMin       = MAX_WORK_LIMIT_MINUTES + tenBreakMin;

  // ── Pausen-Intervalle auf dem Ring ────────────────────────────────────
  const manualIntervals: Interval[] = breaks
    .map(b => ({
      start: Math.max(0, (b.start.getTime() - startTime.getTime()) / 60000),
      end:   Math.max(0, (b.end.getTime()   - startTime.getTime()) / 60000),
    }))
    .filter(m => m.end > m.start);

  const [zone1, zone2]   = calculateLegalPauseZones(grossMin, manualBreaksMin);
  const zone1HintSlots   = placeInZone(zone1.startMin, zone1.endMin, zone1.potentialMin, manualIntervals);
  const zone2HintSlots   = placeInZone(zone2.startMin, zone2.endMin, zone2.potentialMin, manualIntervals);
  const zone1ActiveSlots = trimTotal(zone1HintSlots, zone1.activeMin);
  const zone2ActiveSlots = trimTotal(zone2HintSlots, zone2.activeMin);

  const allBreakIntervals: Interval[] = [
    ...manualIntervals
      .map(m => ({ start: m.start, end: Math.min(m.end, grossMin) }))
      .filter(m => m.end > m.start),
    ...zone1ActiveSlots,
    ...zone2ActiveSlots,
  ];

  const segments  = buildSegments(grossMin, WORK_TIME_TARGET_MINUTES, allBreakIntervals);
  const hintSlots = [...zone1HintSlots, ...zone2HintSlots];

  const breakHoverItems: BreakHoverItem[] = [
    ...breaks
      .map(b => ({
        start:     Math.max(0, (b.start.getTime() - startTime.getTime()) / 60000),
        end:       Math.max(0, (b.end.getTime()   - startTime.getTime()) / 60000),
        kind:      'manual' as const,
        wallStart: b.start,
        wallEnd:   b.end,
      }))
      .filter(m => m.end > m.start),
    ...hintSlots.map(iv => ({
      ...iv,
      kind:      'legal' as const,
      wallStart: addMinutes(startTime, iv.start),
      wallEnd:   addMinutes(startTime, iv.end),
    })),
  ];

  // Marker
  const sollAngle = minToAngle(WORK_TIME_TARGET_MINUTES + sollBreakMin, ringMaxMin);
  const tenAngle  = RING.END_ANGLE;

  // Tages-Maximum (optional)
  let dailyMaxAngle: number | undefined;
  let dailyMaxLimitTime: Date | undefined;
  let minutesToDailyMax: number | undefined;

  if (maxOvertimeMinutes != null) {
    const dailyMaxWorkMin  = WORK_TIME_TARGET_MINUTES + maxOvertimeMinutes;
    const dailyMaxBreakMin = calculateAppliedBreakMinutes(dailyMaxWorkMin, manualBreaksMin);
    dailyMaxLimitTime      = addMinutes(startTime, dailyMaxWorkMin + dailyMaxBreakMin);
    minutesToDailyMax      = dailyMaxWorkMin - netMin;
    if (dailyMaxWorkMin < MAX_WORK_LIMIT_MINUTES) {
      dailyMaxAngle = minToAngle(dailyMaxWorkMin + dailyMaxBreakMin, ringMaxMin);
    }
  }

  // Saldo-Anzeige
  const saldo      = minutesToTimeDuration(saldoMin);
  const saldoText  = `${saldo.negative ? '-' : '+'}${String(saldo.hours).padStart(2, '0')}:${String(saldo.minutes).padStart(2, '0')}`;
  const isOvertime = saldoMin >= 0;

  // Kontextuelle Statusnachricht
  const legalPauseStatus = calculateLegalPauseStatus(grossMin, manualBreaksMin);
  const workdayMsg = getWorkdayMessage({
    currentTime:             now,
    sollMinutes:             WORK_TIME_TARGET_MINUTES,
    workedMinutes:           netMin,
    legalPauseRunning:       legalPauseStatus.isRunning,
    legalPauseMinsRemaining: legalPauseStatus.minsRemaining,
    nextLegalPauseIn:        legalPauseStatus.nextPauseIn,
    nextLegalPauseDeduction: legalPauseStatus.nextPauseDeduction,
    minutesToDailyMax,
    dailyMaxBeforeTenHours:  maxOvertimeMinutes != null && (WORK_TIME_TARGET_MINUTES + maxOvertimeMinutes) < MAX_WORK_LIMIT_MINUTES,
  });

  return {
    grossMin,
    netMin,
    saldoMin,
    manualBreaksMin,
    appliedBreaksMin,
    ringMaxMin,
    segments,
    hintSlots,
    breakHoverItems,
    sollAngle,
    tenAngle,
    finishTime,
    tenLimitTime,
    dailyMaxAngle,
    dailyMaxLimitTime,
    saldoText,
    isOvertime,
    workdayMsg,
  };
}
