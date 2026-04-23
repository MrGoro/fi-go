import { useEffect, useState } from 'react';
import { format, addMinutes } from 'date-fns';
import type { BreakRecord } from '@figo/shared';
import {
  calculateGrossWorkTimeMinutes,
  calculateManualBreaksMinutes,
  calculateAppliedBreakMinutes,
  calculateNetWorkTimeMinutes,
  calculateSaldoMinutes,
  calculateLegalPauseStatus,
  minutesToTimeDuration,
  WORK_TIME_TARGET_HOURS,
  WORK_TIME_TARGET_MINUTES,
  MAX_WORK_LIMIT_MINUTES,
} from '@figo/shared';
import { RING, clamp } from '@/lib/ring-geometry';
import { type Interval, buildSegments } from '@/lib/break-placement';
import { placeInZone, trimTotal } from '@/lib/break-placement';
import { minToAngle } from '@/lib/ring-geometry';
import { Surface } from '@/components/ui/surface';
import { StatCell } from '@/components/ui/stat-cell';
import { getWorkdayMessage } from '@/utils/workdayMessages';
import { TimerRing } from './TimerRing';
import { SaldoCenter } from './SaldoCenter';
import { WorkTimeWarnings } from './WorkTimeWarnings';
import type { BreakHoverItem } from './BreakTooltip';

// Gesetzliche Pausen-Zonen — Positionen in Wall-Minutes seit Start
const LEGAL_Z1_START = 6 * 60;   // 6:00 — 30-Min-Abzug spannt bis 6:30
const LEGAL_Z1_LEN   = 30;
const LEGAL_Z2_START = 9 * 60;   // 9:00 — zusätzliche 15 Min spannt bis 9:15
const LEGAL_Z2_LEN   = 15;

interface DisplayScreenProps {
  startTime: Date;
  breaks: BreakRecord[];
}

export default function DisplayScreen({ startTime, breaks }: DisplayScreenProps) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // ── Berechnungen ──────────────────────────────────────────────────────
  const grossMin         = calculateGrossWorkTimeMinutes(startTime, now);
  const manualBreaksMin  = calculateManualBreaksMinutes(breaks);
  const appliedBreaksMin = calculateAppliedBreakMinutes(grossMin, manualBreaksMin);
  const netMin           = calculateNetWorkTimeMinutes(grossMin, appliedBreaksMin);
  const saldoMin         = calculateSaldoMinutes(netMin);

  const targetMin        = WORK_TIME_TARGET_HOURS * 60 + WORK_TIME_TARGET_MINUTES;

  // Wall-clock Anker
  const sollBreakMin     = Math.max(30, manualBreaksMin); // legal @ 7:36h = 30 min
  const tenBreakMin      = Math.max(45, manualBreaksMin); // legal @ 10h   = 45 min
  const finishTime       = addMinutes(startTime, targetMin + sollBreakMin);
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

  // Gesetzliche Pausen: kanonische Positionen 6:00–6:30 und 9:00–9:15.
  // Manuelle Pausen decken tier-weise (erst die 30, dann die zusätzlichen 15).
  const manualAtTier1    = Math.min(LEGAL_Z1_LEN, manualBreaksMin);
  const manualAtTier2    = Math.min(LEGAL_Z2_LEN, Math.max(0, manualBreaksMin - LEGAL_Z1_LEN));
  // Akkumulierter Abzug an der aktuellen Gross-Zeit (gleitend 6:00→6:30 bzw. 9:00→9:15)
  const t1Accum          = clamp(grossMin - LEGAL_Z1_START, 0, LEGAL_Z1_LEN);
  const t2Accum          = clamp(grossMin - LEGAL_Z2_START, 0, LEGAL_Z2_LEN);
  // Tatsächlich jetzt abzuziehender Anteil (= was noch nicht durch Manuell gedeckt ist)
  const legalActiveZ1    = Math.max(0, t1Accum - manualAtTier1);
  const legalActiveZ2    = Math.max(0, t2Accum - manualAtTier2);
  // Voll-Potenzial: wie lang würde der Abzug insgesamt werden → für den Hint
  const legalPotentialZ1 = Math.max(0, LEGAL_Z1_LEN - manualAtTier1);
  const legalPotentialZ2 = Math.max(0, LEGAL_Z2_LEN - manualAtTier2);

  // Platzierung in freien Slots je Zone (vermeidet Overlap mit manuellen Pausen)
  const zone1HintSlots   = placeInZone(LEGAL_Z1_START, LEGAL_Z1_START + LEGAL_Z1_LEN, legalPotentialZ1, manualIntervals);
  const zone2HintSlots   = placeInZone(LEGAL_Z2_START, LEGAL_Z2_START + LEGAL_Z2_LEN, legalPotentialZ2, manualIntervals);
  const zone1ActiveSlots = trimTotal(zone1HintSlots, legalActiveZ1);
  const zone2ActiveSlots = trimTotal(zone2HintSlots, legalActiveZ2);

  // Alle Break-Intervalle für den Segment-Builder (clipped auf grossMin)
  const allBreakIntervals: Interval[] = [
    ...manualIntervals
      .map(m => ({ start: m.start, end: Math.min(m.end, grossMin) }))
      .filter(m => m.end > m.start),
    ...zone1ActiveSlots,
    ...zone2ActiveSlots,
  ];

  const segments = buildSegments(grossMin, targetMin, allBreakIntervals);
  const hintSlots = [...zone1HintSlots, ...zone2HintSlots];

  // Hover-Items für Pausen-Tooltip (manuelle + aktive gesetzliche)
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

  // Marker-Winkel
  const sollAngle = minToAngle(targetMin + sollBreakMin, ringMaxMin);
  const tenAngle  = RING.END_ANGLE;

  // Saldo-Anzeige
  const saldo     = minutesToTimeDuration(saldoMin);
  const saldoText = `${saldo.negative ? '-' : '+'}${String(saldo.hours).padStart(2, '0')}:${String(saldo.minutes).padStart(2, '0')}`;
  const isOvertime = saldoMin >= 0;

  // Kontextuelle Statusnachricht
  const legalPauseStatus = calculateLegalPauseStatus(grossMin, manualBreaksMin);
  const workdayMsg = getWorkdayMessage({
    currentTime:             now,
    sollMinutes:             targetMin,
    workedMinutes:           netMin,
    legalPauseRunning:       legalPauseStatus.isRunning,
    legalPauseMinsRemaining: legalPauseStatus.minsRemaining,
    nextLegalPauseIn:        legalPauseStatus.nextPauseIn,
    nextLegalPauseDeduction: legalPauseStatus.nextPauseDeduction,
  });

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-5 py-6 animate-in fade-in duration-700">
      <WorkTimeWarnings netMin={netMin} />

      <TimerRing
        grossMin={grossMin}
        ringMaxMin={ringMaxMin}
        segments={segments}
        hintSlots={hintSlots}
        breakHoverItems={breakHoverItems}
        sollAngle={sollAngle}
        sollLabel={format(finishTime, 'HH:mm')}
        tenAngle={tenAngle}
        tenLabel={format(tenLimitTime, 'HH:mm')}
      >
        <SaldoCenter saldoText={saldoText} isOvertime={isOvertime} message={workdayMsg} />
      </TimerRing>

      <Surface variant="card" className="w-full max-w-sm">
        <div className="grid grid-cols-2 divide-x divide-white/80 dark:divide-neutral-700/60">
          <StatCell label="Start" value={format(startTime, 'HH:mm')} />
          <StatCell
            label="Pause"
            value={`${appliedBreaksMin} Min`}
            hint={appliedBreaksMin > manualBreaksMin ? `inkl. ${appliedBreaksMin - manualBreaksMin} min gesetzl.` : undefined}
          />
        </div>
      </Surface>
    </div>
  );
}
