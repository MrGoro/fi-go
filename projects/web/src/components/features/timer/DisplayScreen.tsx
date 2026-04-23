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
import { cn } from '@/lib/utils';
import { getWorkdayMessage } from '@/utils/workdayMessages';

/* ──────────────────────────────────────────────────────────────────────────
   Ring-Geometrie
   240°-Bogen, offen unten. 0° = 12 Uhr, CW positiv.
   ────────────────────────────────────────────────────────────────────────── */

const CX = 170;
const CY = 170;
const RADIUS = 128;
const STROKE = 22;
const START_ANGLE = -120;
const END_ANGLE = 120;
const SWEEP = END_ANGLE - START_ANGLE; // 240

const COLOR_TRACK      = 'oklch(0.928 0.006 264)';  // neutral-200
const COLOR_WORK       = '#E5173F';                 // primary
const COLOR_OVER       = '#F97316';                 // orange-500
const COLOR_BREAK      = 'oklch(0.78 0.115 22)';    // rose — leicht abgesetzte Variante der Primärfarbe
const COLOR_BREAK_HINT = 'oklch(0.90 0.060 22)';    // sehr zartes Rosa — Vorschau auf künftigen Abzug

// Gesetzliche Pausen-Zonen — Positionen in Wall-Minutes seit Start
const LEGAL_Z1_START = 6 * 60;   // 6:00 — 30-Min-Abzug spannt bis 6:30
const LEGAL_Z1_LEN   = 30;
const LEGAL_Z2_START = 9 * 60;   // 9:00 — zusätzliche 15 Min spannt bis 9:15
const LEGAL_Z2_LEN   = 15;

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

const pointOnRing = (deg: number, r = RADIUS) => {
  const rad = (deg * Math.PI) / 180;
  return { x: CX + r * Math.sin(rad), y: CY - r * Math.cos(rad) };
};

const arcPath = (startDeg: number, endDeg: number, r = RADIUS) => {
  if (endDeg - startDeg < 0.02) return '';
  const s = pointOnRing(startDeg, r);
  const e = pointOnRing(endDeg, r);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
};

const minToAngle = (min: number, maxMin: number) =>
  START_ANGLE + (Math.max(0, Math.min(maxMin, min)) / maxMin) * SWEEP;

// Each round linecap adds STROKE/2 ≈ 11px beyond the endpoint (≈ 4.9° at RADIUS=128).
// Two caps together consume ~10°, so anything shorter vanishes. Enforce a minimum of
// 14° (≈ 9px visible body) centred on the true midpoint so short pauses stay readable.
const MIN_BREAK_SWEEP = 14;
const expandBreak = (a0: number, a1: number): [number, number] => {
  if (a1 - a0 >= MIN_BREAK_SWEEP) return [a0, a1];
  const mid = (a0 + a1) / 2;
  return [mid - MIN_BREAK_SWEEP / 2, mid + MIN_BREAK_SWEEP / 2];
};

/* ──────────────────────────────────────────────────────────────────────────
   Helpers für Pausen-Platzierung
   ────────────────────────────────────────────────────────────────────────── */

interface IV { start: number; end: number; }

// Legt `needed` Minuten gesetzliche Pause in die freien Slots einer Zone,
// ohne manuelle Pausen zu überlappen.
function placeInZone(zoneStart: number, zoneEnd: number, needed: number, manuals: IV[]): IV[] {
  if (needed <= 0) return [];
  const occupied = manuals
    .map(m => ({ start: Math.max(m.start, zoneStart), end: Math.min(m.end, zoneEnd) }))
    .filter(m => m.end > m.start)
    .sort((a, b) => a.start - b.start);

  const result: IV[] = [];
  let cursor = zoneStart;
  let remaining = needed;
  for (const occ of occupied) {
    if (remaining <= 0) break;
    if (occ.start > cursor) {
      const use = Math.min(remaining, occ.start - cursor);
      result.push({ start: cursor, end: cursor + use });
      remaining -= use;
    }
    cursor = Math.max(cursor, occ.end);
  }
  if (remaining > 0 && cursor < zoneEnd) {
    const use = Math.min(remaining, zoneEnd - cursor);
    result.push({ start: cursor, end: cursor + use });
  }
  return result;
}

// Kürzt eine Liste von Intervallen auf insgesamt `total` Minuten (behält Reihenfolge).
function trimTotal(ivs: IV[], total: number): IV[] {
  if (total <= 0) return [];
  const result: IV[] = [];
  let remaining = total;
  for (const iv of ivs) {
    if (remaining <= 0) break;
    const use = Math.min(remaining, iv.end - iv.start);
    result.push({ start: iv.start, end: iv.start + use });
    remaining -= use;
  }
  return result;
}

/* ──────────────────────────────────────────────────────────────────────────
   Segment-Builder
   Nimmt konkrete Break-Intervalle und baut daraus eine chronologische Kette
   aus work/break-Blöcken, die dann an der Sollzeit-Grenze zu rot/orange
   aufgesplittet wird. netAccum läuft nur über Work-Blöcke → Sollzeit-Marker
   stimmt unabhängig davon, wo die Pausen liegen.
   ────────────────────────────────────────────────────────────────────────── */

type SegKind = 'work' | 'over' | 'break';
interface Seg { start: number; end: number; kind: SegKind; }

interface BreakHoverItem {
  start: number; end: number;
  kind: 'manual' | 'legal';
  wallStart: Date; wallEnd: Date;
}

function buildSegments(grossMin: number, targetMin: number, breakIntervals: IV[]): Seg[] {
  if (grossMin <= 0) return [];

  const sorted = [...breakIntervals].sort((a, b) => a.start - b.start);

  const raw: Seg[] = [];
  let cursor = 0;
  for (const iv of sorted) {
    const s = Math.max(iv.start, cursor);
    const e = Math.min(iv.end, grossMin);
    if (e <= s) continue;
    if (s > cursor) raw.push({ start: cursor, end: s, kind: 'work' });
    raw.push({ start: s, end: e, kind: 'break' });
    cursor = e;
  }
  if (cursor < grossMin) raw.push({ start: cursor, end: grossMin, kind: 'work' });

  const final: Seg[] = [];
  let netAccum = 0;
  for (const seg of raw) {
    if (seg.kind !== 'work') { final.push(seg); continue; }
    const len = seg.end - seg.start;
    if (len <= 0) continue;
    if (netAccum + len <= targetMin) {
      final.push(seg);
    } else if (netAccum >= targetMin) {
      final.push({ ...seg, kind: 'over' });
    } else {
      const split = seg.start + (targetMin - netAccum);
      final.push({ start: seg.start, end: split, kind: 'work' });
      final.push({ start: split, end: seg.end, kind: 'over' });
    }
    netAccum += len;
  }
  return final;
}

/* ──────────────────────────────────────────────────────────────────────────
   Haupt-Komponente
   ────────────────────────────────────────────────────────────────────────── */

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

  // ── Berechnungen (Logik unverändert) ──────────────────────────────────
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
  // Manuell: an ihrer tatsächlichen Wall-Time-Position
  const manualIntervals: IV[] = breaks
    .map(b => ({
      start: Math.max(0, (b.start.getTime() - startTime.getTime()) / 60000),
      end:   Math.max(0, (b.end.getTime()   - startTime.getTime()) / 60000),
    }))
    .filter(m => m.end > m.start);

  // Gesetzliche Pausen: kanonische Positionen 6:00–6:30 und 9:00–9:15.
  // Manuelle Pausen decken tier-weise (erst die 30, dann die zusätzlichen 15).
  const manualAtTier1   = Math.min(LEGAL_Z1_LEN, manualBreaksMin);
  const manualAtTier2   = Math.min(LEGAL_Z2_LEN, Math.max(0, manualBreaksMin - LEGAL_Z1_LEN));
  // Akkumulierter Abzug an der aktuellen Gross-Zeit (gleitend 6:00→6:30 bzw. 9:00→9:15)
  const t1Accum         = clamp(grossMin - LEGAL_Z1_START, 0, LEGAL_Z1_LEN);
  const t2Accum         = clamp(grossMin - LEGAL_Z2_START, 0, LEGAL_Z2_LEN);
  // Tatsächlich jetzt abzuziehender Anteil (= was noch nicht durch Manuell gedeckt ist)
  const legalActiveZ1   = Math.max(0, t1Accum - manualAtTier1);
  const legalActiveZ2   = Math.max(0, t2Accum - manualAtTier2);
  // Voll-Potenzial: wie lang würde der Abzug insgesamt werden → für den Hint
  const legalPotentialZ1 = Math.max(0, LEGAL_Z1_LEN - manualAtTier1);
  const legalPotentialZ2 = Math.max(0, LEGAL_Z2_LEN - manualAtTier2);

  // Platzierung in freien Slots je Zone (vermeidet Overlap mit manuellen Pausen)
  const zone1HintSlots   = placeInZone(LEGAL_Z1_START, LEGAL_Z1_START + LEGAL_Z1_LEN, legalPotentialZ1, manualIntervals);
  const zone2HintSlots   = placeInZone(LEGAL_Z2_START, LEGAL_Z2_START + LEGAL_Z2_LEN, legalPotentialZ2, manualIntervals);
  const zone1ActiveSlots = trimTotal(zone1HintSlots, legalActiveZ1);
  const zone2ActiveSlots = trimTotal(zone2HintSlots, legalActiveZ2);

  // Alle Break-Intervalle für den Segment-Builder (clipped auf grossMin)
  const allBreakIntervals: IV[] = [
    ...manualIntervals
      .map(m => ({ start: m.start, end: Math.min(m.end, grossMin) }))
      .filter(m => m.end > m.start),
    ...zone1ActiveSlots,
    ...zone2ActiveSlots,
  ];

  const segments = buildSegments(grossMin, targetMin, allBreakIntervals);

  // Hover-Items für Pausen-Tooltip (manuelle + aktive gesetzliche)
  const [hoveredBreak, setHoveredBreak] = useState<BreakHoverItem | null>(null);
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
    ...[...zone1HintSlots, ...zone2HintSlots].map(iv => ({
      ...iv,
      kind:      'legal' as const,
      wallStart: addMinutes(startTime, iv.start),
      wallEnd:   addMinutes(startTime, iv.end),
    })),
  ];
  // Tooltip-Position: Mittelpunkt des Bogens, bei 70 % des Ring-Radius nach innen
  const breakTooltip = hoveredBreak ? (() => {
    const midAngle = minToAngle((hoveredBreak.start + hoveredBreak.end) / 2, ringMaxMin);
    const rad = midAngle * Math.PI / 180;
    const rT = RADIUS * 0.70;
    return {
      x:    (CX + rT * Math.sin(rad)) / 340 * 100,
      y:    (CY - rT * Math.cos(rad)) / 340 * 100,
      item: hoveredBreak,
    };
  })() : null;

  // Marker-Winkel
  const sollAngle        = minToAngle(targetMin + sollBreakMin, ringMaxMin);
  const tenAngle         = END_ANGLE;
  const tipPoint         = grossMin > 0 ? pointOnRing(minToAngle(grossMin, ringMaxMin)) : null;

  // Saldo-Anzeige
  const saldo            = minutesToTimeDuration(saldoMin);
  const saldoText        = `${saldo.negative ? '-' : '+'}${String(saldo.hours).padStart(2, '0')}:${String(saldo.minutes).padStart(2, '0')}`;
  const isOvertime       = saldoMin >= 0;

  // Warnungen
  const minutesToTen     = MAX_WORK_LIMIT_MINUTES - netMin;
  const minutesOver      = netMin - MAX_WORK_LIMIT_MINUTES;
  const showWarning      = netMin >= MAX_WORK_LIMIT_MINUTES - 30 && netMin < MAX_WORK_LIMIT_MINUTES;
  const showError        = netMin >= MAX_WORK_LIMIT_MINUTES;

  // Kontextuelle Statusnachricht — Pausenstatus kommt aus @figo/shared
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

      {/* ── Banner ─────────────────────────────────────────────────────── */}
      {showWarning && (
        <div
          role="alert"
          className="w-full max-w-md flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-orange-500/12 border border-orange-500/30 text-orange-700 text-sm font-semibold backdrop-blur-md shadow-sm animate-in slide-in-from-top-2 duration-300 dark:text-orange-300"
        >
          <span className="text-base leading-none">⚠️</span>
          <span>
            Noch <span className="tabular-nums">{minutesToTen}</span> Minuten bis zur 10h-Grenze
          </span>
        </div>
      )}
      {showError && (
        <div
          role="alert"
          className="w-full max-w-md flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-destructive/12 border border-destructive/40 text-destructive text-sm font-bold backdrop-blur-md shadow-sm animate-pulse"
        >
          <span className="text-base leading-none">🚫</span>
          <span>
            10h-Grenze seit <span className="tabular-nums">{minutesOver}</span> Minuten überschritten
          </span>
        </div>
      )}

      {/* ── Ring ───────────────────────────────────────────────────────── */}
      <div className="relative w-full max-w-full sm:max-w-[440px] aspect-square">
        <svg viewBox="0 0 340 340" className="w-full h-full" aria-hidden="true">
          {/* Track */}
          <path
            d={arcPath(START_ANGLE, END_ANGLE)}
            stroke={COLOR_TRACK}
            strokeWidth={STROKE}
            strokeLinecap="round"
            fill="none"
          />

          {/* Hint: künftiger gesetzlicher Pausenabzug — zartes Rosa an den kanonischen Zonen */}
          {[...zone1HintSlots, ...zone2HintSlots].map((iv, i) => {
            const [a0, a1] = expandBreak(minToAngle(iv.start, ringMaxMin), minToAngle(iv.end, ringMaxMin));
            return (
              <path
                key={`hint-${i}`}
                d={arcPath(a0, a1)}
                stroke={COLOR_BREAK_HINT}
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}

          {/* Work/Over-Segmente mit Drop-Shadow für Tiefe */}
          <g style={{ filter: 'drop-shadow(0 0 5px rgba(229,23,63,0.28))' }}>
            {segments.filter(s => s.kind !== 'break').map((seg, i) => {
              const a0 = minToAngle(seg.start, ringMaxMin);
              const a1 = minToAngle(seg.end, ringMaxMin);
              if (a1 - a0 < 0.02) return null;
              const color = seg.kind === 'work' ? COLOR_WORK : COLOR_OVER;
              return (
                <path
                  key={`act-${i}`}
                  d={arcPath(a0, a1)}
                  stroke={color}
                  strokeWidth={STROKE}
                  strokeLinecap="round"
                  fill="none"
                />
              );
            })}
          </g>

          {/* Break-Segmente — nach Work/Over gemalt damit kurze Pausen sichtbar bleiben */}
          {segments.filter(s => s.kind === 'break').map((seg, i) => {
            const [a0, a1] = expandBreak(minToAngle(seg.start, ringMaxMin), minToAngle(seg.end, ringMaxMin));
            if (a1 - a0 < 0.02) return null;
            return (
              <path
                key={`brk-${i}`}
                d={arcPath(a0, a1)}
                stroke={COLOR_BREAK}
                strokeWidth={STROKE}
                strokeLinecap="round"
                fill="none"
              />
            );
          })}

          {/* Glowing end cap am aktuellen Fortschritts-Tip */}
          {tipPoint && (
            <circle
              cx={tipPoint.x}
              cy={tipPoint.y}
              r={6}
              fill={COLOR_WORK}
              style={{ filter: 'drop-shadow(0 0 7px #E5173F)' }}
            />
          )}

          {/* Marker: Striche außerhalb des Rings — Ring bleibt ununterbrochen */}
          <TickMarker angle={sollAngle} label={format(finishTime, 'HH:mm')} color={COLOR_WORK} />
          <TickMarker angle={tenAngle}  label={format(tenLimitTime, 'HH:mm')} color={COLOR_OVER} />

          {/* Transparente Hit-Areas für Pausen-Hover — breiter Stroke für einfaches Targeting */}
          {breakHoverItems.map((item, i) => {
            const [a0, a1] = expandBreak(minToAngle(item.start, ringMaxMin), minToAngle(item.end, ringMaxMin));
            if (a1 - a0 < 0.02) return null;
            return (
              <path
                key={`bhit-${i}`}
                d={arcPath(a0, a1)}
                stroke="transparent"
                strokeWidth={STROKE + 14}
                strokeLinecap="round"
                fill="none"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredBreak(item)}
                onMouseLeave={() => setHoveredBreak(null)}
              />
            );
          })}
        </svg>

        {/* Pausen-Tooltip */}
        {breakTooltip && (
          <div
            className="absolute pointer-events-none select-none z-10 animate-in fade-in duration-150"
            style={{
              left:      `${breakTooltip.x}%`,
              top:       `${breakTooltip.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div className="bg-white/95 backdrop-blur-sm shadow-lg border border-border/30 rounded-xl px-2.5 py-1.5 text-center whitespace-nowrap">
              <p className="text-[12px] font-semibold tabular-nums text-foreground leading-none">
                {format(breakTooltip.item.wallStart, 'HH:mm')} – {format(breakTooltip.item.wallEnd, 'HH:mm')}
              </p>
              {breakTooltip.item.kind === 'legal' && (
                <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
                  Gesetzl. Pause
                </p>
              )}
            </div>
          </div>
        )}

        {/* Zentrum: Saldo dominant + Subtext */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-8">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/50 mb-2.5">
            {isOvertime ? 'Überstunden' : 'Saldo'}
          </p>
          <div
            className={cn(
              'font-bold tabular-nums leading-none tracking-tight',
              'text-[50px] sm:text-[62px]'
            )}
            style={{ color: COLOR_WORK }}
          >
            {saldoText}
          </div>
          {workdayMsg && (
            <p className={cn(
              'text-[12px] sm:text-[13px] mt-3 font-medium leading-snug text-balance max-w-[58%]',
              workdayMsg.type === 'urgent'  && 'text-destructive',
              workdayMsg.type === 'warning' && 'text-orange-500',
              workdayMsg.type === 'success' && 'text-green-500',
              workdayMsg.type === 'info'    && 'text-muted-foreground/90',
            )}>
              {workdayMsg.text}
            </p>
          )}
        </div>

      </div>

      {/* ── Sekundäre Info — Glassmorphism-Card ─────────────────────────── */}
      <div className="w-full max-w-sm rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 shadow-[0_8px_32px_-6px_oklch(0.510_0.230_22_/_0.14),0_2px_8px_-2px_oklch(0_0_0_/_0.07)] dark:bg-neutral-900/55 dark:border-neutral-700/60">
        <div className="grid grid-cols-2 divide-x divide-white/80 dark:divide-neutral-700/60">
          <InfoCell label="Start" value={format(startTime, 'HH:mm')} />
          <InfoCell
            label="Pause"
            value={`${appliedBreaksMin} Min`}
            hint={appliedBreaksMin > manualBreaksMin ? `inkl. ${appliedBreaksMin - manualBreaksMin} min gesetzl.` : undefined}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Hilfs-Komponenten ─────────────────────────────────────────────────── */

function InfoCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center px-4 py-3.5">
      <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-muted-foreground/60 mb-1.5">
        {label}
      </span>
      <span className="text-[17px] font-semibold tabular-nums text-foreground leading-none">
        {value}
      </span>
      {hint && (
        <span className="text-[10px] text-muted-foreground/55 mt-1 tracking-tight">
          {hint}
        </span>
      )}
    </div>
  );
}

function TickMarker({ angle, label, color }: { angle: number; label: string; color: string }) {
  const rInner = RADIUS + STROKE / 2 + 4;   // gap from outer ring edge
  const rOuter = rInner + 12;               // 12px tick length
  const rLabel = rOuter + 5;

  const p1 = pointOnRing(angle, rInner);
  const p2 = pointOnRing(angle, rOuter);

  const rad = (angle * Math.PI) / 180;
  const lx = CX + rLabel * Math.sin(rad);
  const ly = CY - rLabel * Math.cos(rad);
  const anchor = angle > 15 ? 'start' : angle < -15 ? 'end' : 'middle';

  return (
    <g>
      <line
        x1={p1.x} y1={p1.y}
        x2={p2.x} y2={p2.y}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <text
        x={lx}
        y={ly}
        textAnchor={anchor}
        dominantBaseline="middle"
        fontSize="10"
        fill={color}
        fontWeight="700"
        letterSpacing="0.02em"
      >
        {label}
      </text>
    </g>
  );
}
