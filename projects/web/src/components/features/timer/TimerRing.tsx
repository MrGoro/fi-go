import { useState, type ReactNode } from 'react';
import {
  RING,
  RING_COLORS,
  arcPath,
  expandBreak,
  minToAngle,
  pointOnRing,
} from '@/lib/ring-geometry';
import type { Interval, Seg } from '@/lib/break-placement';
import { TickMarker } from './TickMarker';
import { BreakTooltip } from './BreakTooltip';
import type { BreakHoverItem } from '@/hooks/useTimerCalculations';

interface TimerRingProps {
  grossMin: number;
  ringMaxMin: number;
  segments: Seg[];
  hintSlots: Interval[];
  breakHoverItems: BreakHoverItem[];
  /** Winkel des Soll-Markers */
  sollAngle: number;
  sollLabel: string;
  /** Winkel der 10h-Grenze (konstant = END_ANGLE) */
  tenAngle: number;
  tenLabel: string;
  /** Zentrum-Inhalt (Saldo + Nachricht), als Slot */
  children?: ReactNode;
}

export function TimerRing({
  grossMin,
  ringMaxMin,
  segments,
  hintSlots,
  breakHoverItems,
  sollAngle,
  sollLabel,
  tenAngle,
  tenLabel,
  children,
}: TimerRingProps) {
  const [hovered, setHovered] = useState<BreakHoverItem | null>(null);

  const tipPoint = grossMin > 0 ? pointOnRing(minToAngle(grossMin, ringMaxMin)) : null;

  // Tooltip-Position: Mittelpunkt des Bogens, bei 70 % des Ring-Radius nach innen
  const tooltip = hovered ? (() => {
    const midAngle = minToAngle((hovered.start + hovered.end) / 2, ringMaxMin);
    const rad = midAngle * Math.PI / 180;
    const rT = RING.RADIUS * 0.70;
    return {
      x: ((RING.CX + rT * Math.sin(rad)) / 340) * 100,
      y: ((RING.CY - rT * Math.cos(rad)) / 340) * 100,
      item: hovered,
    };
  })() : null;

  return (
    <div className="relative w-full max-w-full sm:max-w-[440px] aspect-square">
      <svg viewBox="0 0 340 340" className="w-full h-full" aria-hidden="true">
        {/* Track */}
        <path
          d={arcPath(RING.START_ANGLE, RING.END_ANGLE)}
          stroke={RING_COLORS.track}
          strokeWidth={RING.STROKE}
          strokeLinecap="round"
          fill="none"
        />

        {/* Hint: künftiger gesetzlicher Pausenabzug */}
        {hintSlots.map((iv, i) => {
          const [a0, a1] = expandBreak(minToAngle(iv.start, ringMaxMin), minToAngle(iv.end, ringMaxMin));
          return (
            <path
              key={`hint-${i}`}
              d={arcPath(a0, a1)}
              stroke={RING_COLORS.breakHint}
              strokeWidth={RING.STROKE}
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
            const color = seg.kind === 'work' ? RING_COLORS.work : RING_COLORS.over;
            return (
              <path
                key={`act-${i}`}
                d={arcPath(a0, a1)}
                stroke={color}
                strokeWidth={RING.STROKE}
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
              stroke={RING_COLORS.break}
              strokeWidth={RING.STROKE}
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
            fill={RING_COLORS.work}
            style={{ filter: 'drop-shadow(0 0 7px #E5173F)' }}
          />
        )}

        {/* Marker: Striche außerhalb des Rings — Ring bleibt ununterbrochen */}
        <TickMarker angle={sollAngle} label={sollLabel} color={RING_COLORS.work} />
        <TickMarker angle={tenAngle}  label={tenLabel}  color={RING_COLORS.over} />

        {/* Transparente Hit-Areas für Pausen-Hover */}
        {breakHoverItems.map((item, i) => {
          const [a0, a1] = expandBreak(minToAngle(item.start, ringMaxMin), minToAngle(item.end, ringMaxMin));
          if (a1 - a0 < 0.02) return null;
          return (
            <path
              key={`bhit-${i}`}
              d={arcPath(a0, a1)}
              stroke="transparent"
              strokeWidth={RING.STROKE + 14}
              strokeLinecap="round"
              fill="none"
              style={{ cursor: 'pointer' }}
              onMouseEnter={() => setHovered(item)}
              onMouseLeave={() => setHovered(null)}
            />
          );
        })}
      </svg>

      {tooltip && <BreakTooltip x={tooltip.x} y={tooltip.y} item={tooltip.item} />}

      {children}
    </div>
  );
}
