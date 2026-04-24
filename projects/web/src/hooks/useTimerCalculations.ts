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
  minutesToTimeDuration,
  WORK_TIME_TARGET_MINUTES,
  MAX_WORK_LIMIT_MINUTES,
} from '@figo/shared';
import { RING, clamp, minToAngle } from '@/lib/ring-geometry';
import { buildSegments, placeInZone, trimTotal, type Interval, type Seg } from '@/lib/break-placement';
import { getWorkdayMessage, type WorkdayMessage } from '@/components/features/timer/workdayStatus';

// Gesetzliche Pausen-Zonen — Positionen in Wall-Minutes seit Start
const LEGAL_Z1_START = 6 * 60;   // 6:00 — 30-Min-Abzug spannt bis 6:30
const LEGAL_Z1_LEN   = 30;
const LEGAL_Z2_START = 9 * 60;   // 9:00 — zusätzliche 15 Min spannt bis 9:15
const LEGAL_Z2_LEN   = 15;

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
export function useTimerCalculations(startTime: Date, breaks: BreakRecord[]): TimerCalculations {
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

  // Wall-clock Anker
  const sollBreakMin     = Math.max(30, manualBreaksMin); // legal @ 7:36h = 30 min
  const tenBreakMin      = Math.max(45, manualBreaksMin); // legal @ 10h   = 45 min
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

  // Manuelle Pausen decken tier-weise (erst die 30, dann die zusätzlichen 15).
  const manualAtTier1    = Math.min(LEGAL_Z1_LEN, manualBreaksMin);
  const manualAtTier2    = Math.min(LEGAL_Z2_LEN, Math.max(0, manualBreaksMin - LEGAL_Z1_LEN));
  // Akkumulierter Abzug an aktueller Gross-Zeit (gleitend 6:00→6:30 bzw. 9:00→9:15)
  const t1Accum          = clamp(grossMin - LEGAL_Z1_START, 0, LEGAL_Z1_LEN);
  const t2Accum          = clamp(grossMin - LEGAL_Z2_START, 0, LEGAL_Z2_LEN);
  // Was JETZT abzuziehen ist (= nicht durch manuelle Pause gedeckt)
  const legalActiveZ1    = Math.max(0, t1Accum - manualAtTier1);
  const legalActiveZ2    = Math.max(0, t2Accum - manualAtTier2);
  // Voll-Potenzial → Hint-Darstellung
  const legalPotentialZ1 = Math.max(0, LEGAL_Z1_LEN - manualAtTier1);
  const legalPotentialZ2 = Math.max(0, LEGAL_Z2_LEN - manualAtTier2);

  const zone1HintSlots   = placeInZone(LEGAL_Z1_START, LEGAL_Z1_START + LEGAL_Z1_LEN, legalPotentialZ1, manualIntervals);
  const zone2HintSlots   = placeInZone(LEGAL_Z2_START, LEGAL_Z2_START + LEGAL_Z2_LEN, legalPotentialZ2, manualIntervals);
  const zone1ActiveSlots = trimTotal(zone1HintSlots, legalActiveZ1);
  const zone2ActiveSlots = trimTotal(zone2HintSlots, legalActiveZ2);

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
    saldoText,
    isOvertime,
    workdayMsg,
  };
}
