import { format } from 'date-fns';
import { Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { FirebaseBreakRecord } from '@/hooks/useSessionData';

interface BreaksListProps {
  breaks: FirebaseBreakRecord[];
  onRemove: (id: string) => void;
}

export function BreaksList({ breaks, onRemove }: BreaksListProps) {
  const totalMins = breaks.reduce(
    (sum, b) => sum + Math.floor((b.end.getTime() - b.start.getTime()) / 60000),
    0,
  );

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <Eyebrow as="h3">Erfasste Pausen</Eyebrow>
        {breaks.length > 0 && (
          <span className="text-[11px] text-muted-foreground/70 tabular-nums">
            {totalMins} Min. gesamt
          </span>
        )}
      </div>

      {breaks.length === 0 ? (
        <div className="text-sm text-center py-7 text-muted-foreground/60 bg-muted/20 rounded-2xl border border-dashed border-border/60">
          Noch keine Pausen erfasst.
        </div>
      ) : (
        <ul className="space-y-2">
          {breaks.map(b => {
            const mins = Math.floor((b.end.getTime() - b.start.getTime()) / 60000);
            return (
              <li
                key={b.id}
                className="flex items-center justify-between bg-card border border-border/60 px-4 py-3 rounded-2xl"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground/60 shrink-0" />
                  <span className="font-semibold tabular-nums text-[15px]">
                    {format(b.start, 'HH:mm')} – {format(b.end, 'HH:mm')}
                  </span>
                  <span className="text-xs text-muted-foreground/60 tabular-nums">
                    {mins} Min.
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemove(b.id)}
                  className="text-destructive/70 hover:text-destructive hover:bg-destructive/10 -mr-1 h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
