import { format } from 'date-fns';
import type { BreakHoverItem } from '@/hooks/useTimerCalculations';

interface BreakTooltipProps {
  /** Position als Prozent der SVG-Fläche (0..100). */
  x: number;
  y: number;
  item: BreakHoverItem;
}

export function BreakTooltip({ x, y, item }: BreakTooltipProps) {
  return (
    <div
      className="absolute pointer-events-none select-none z-10 animate-in fade-in duration-150"
      style={{
        left:      `${x}%`,
        top:       `${y}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      <div className="bg-popover/95 backdrop-blur-sm shadow-lg border border-border/50 rounded-xl px-2.5 py-1.5 text-center whitespace-nowrap">
        <p className="text-[12px] font-semibold tabular-nums text-popover-foreground leading-none">
          {format(item.wallStart, 'HH:mm')} – {format(item.wallEnd, 'HH:mm')}
        </p>
        {item.kind === 'legal' && (
          <p className="text-[10px] text-muted-foreground/60 mt-1 font-medium">
            Gesetzl. Pause
          </p>
        )}
      </div>
    </div>
  );
}
