import { RING, pointOnRing } from '@/lib/ring-geometry';

interface TickMarkerProps {
  angle: number;
  label: string;
  color: string;
}

/**
 * Kurzer Strich außerhalb des Rings + dazugehöriges Label.
 * Bleibt visuell entkoppelt vom Ring, damit dieser ununterbrochen ist.
 */
export function TickMarker({ angle, label, color }: TickMarkerProps) {
  const rInner = RING.RADIUS + RING.STROKE / 2 + 4; // gap from outer ring edge
  const rOuter = rInner + 12;                        // 12px tick length
  const rLabel = rOuter + 5;

  const p1 = pointOnRing(angle, rInner);
  const p2 = pointOnRing(angle, rOuter);

  const rad = (angle * Math.PI) / 180;
  const lx = RING.CX + rLabel * Math.sin(rad);
  const ly = RING.CY - rLabel * Math.cos(rad);
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
