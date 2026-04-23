import { useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Coffee, Clock, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FirebaseBreakRecord } from '@/hooks/useSessionData';

interface BreaksDrawerProps {
  breaks: FirebaseBreakRecord[];
  onAddBreak: (start: Date, end: Date) => void;
  onRemoveBreak: (id: string) => void;
  startTime: Date;
  desktopMode?: boolean;
}

const parseToTodayDate = (timeStr: string) => {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

export default function BreaksDrawer({ breaks, onAddBreak, onRemoveBreak, startTime, desktopMode }: BreaksDrawerProps) {
  const [open, setOpen] = useState(false);
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const focusRef = useRef<HTMLDivElement>(null);

  const isTimeOrderInvalid = !!(startStr && endStr && parseToTodayDate(endStr) <= parseToTodayDate(startStr));
  const isBeforeStart = !!(startStr && parseToTodayDate(startStr) < startTime);
  const hasOverlap = !!(startStr && endStr && !isTimeOrderInvalid && !isBeforeStart && (() => {
    const ns = parseToTodayDate(startStr).getTime();
    const ne = parseToTodayDate(endStr).getTime();
    return breaks.some(b => ns < b.end.getTime() && ne > b.start.getTime());
  })());

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startStr || !endStr || isTimeOrderInvalid || isBeforeStart || hasOverlap || submitting) return;

    const start = parseToTodayDate(startStr);
    const end = parseToTodayDate(endStr);


    setSubmitting(true);
    try {
      await onAddBreak(start, end);
      setStartStr('');
      setEndStr('');
    } catch (error) {
      console.error('Add break error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const totalBreakMins = breaks.reduce(
    (sum, b) => sum + Math.floor((b.end.getTime() - b.start.getTime()) / 60000),
    0,
  );

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        {desktopMode ? (
          <Button variant="ghost" className="rounded-full border border-[#E5173F] text-[#E5173F] hover:bg-[#E5173F]/10 hover:text-[#E5173F]">
            <Coffee className="mr-2 h-4 w-4" /> Pausen
          </Button>
        ) : (
          <Button variant="ghost" className="flex flex-col gap-1 h-auto py-2.5 px-5 text-[#999] hover:text-[#E5173F] hover:bg-transparent">
            <Coffee className="h-6 w-6" />
            <span className="text-[10px] font-medium uppercase tracking-wider">Pausen</span>
          </Button>
        )}
      </DrawerTrigger>

      <DrawerContent
        className="max-w-md mx-auto"
        onOpenAutoFocus={e => {
          // Prevent focus landing on any input (avoids iOS time-picker on open).
          // Instead move focus to the inert container so aria-hidden on #root stays valid.
          e.preventDefault();
          focusRef.current?.focus();
        }}
      >
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Coffee className="h-6 w-6 text-primary" /> Manuelle Pausen
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Pausenzeiten manuell erfassen oder löschen.
          </DrawerDescription>
        </DrawerHeader>

        {/* tabIndex={-1}/outline-none: programmatic focus target, not in tab order */}
        <div ref={focusRef} tabIndex={-1} className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 flex flex-col gap-6 outline-none">

          {/* ── Erfasste Pausen ───────────────────────────────────────────── */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
                Erfasste Pausen
              </h3>
              {breaks.length > 0 && (
                <span className="text-[11px] text-muted-foreground/70 tabular-nums">
                  {totalBreakMins} Min. gesamt
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
                        onClick={() => onRemoveBreak(b.id)}
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

          {/* ── Neue Pause erfassen ───────────────────────────────────────── */}
          <section className="space-y-3">
            <h3 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground/60">
              Neue Pause erfassen
            </h3>

            <form onSubmit={handleAdd} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* min-w-0 prevents grid children from overflowing on iOS */}
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium pl-1">Start</label>
                  <Input
                    type="time"
                    value={startStr}
                    onChange={e => setStartStr(e.target.value)}
                    required
                    className="h-12 text-lg text-center font-mono px-1"
                  />
                </div>
                <div className="space-y-1.5 min-w-0">
                  <label className="text-xs font-medium pl-1">Ende</label>
                  <Input
                    type="time"
                    value={endStr}
                    onChange={e => setEndStr(e.target.value)}
                    required
                    className="h-12 text-lg text-center font-mono px-1"
                  />
                </div>
              </div>

              {isTimeOrderInvalid && (
                <p className="text-[11px] text-destructive/80 font-medium text-center animate-in fade-in slide-in-from-top-1 duration-200">
                  Die Endzeit muss nach der Startzeit liegen.
                </p>
              )}

              {isBeforeStart && (
                <p className="text-[11px] text-destructive/80 font-medium text-center animate-in fade-in slide-in-from-top-1 duration-200">
                  Pause kann nicht vor Dienstbeginn ({format(startTime, 'HH:mm')}) liegen.
                </p>
              )}

              {hasOverlap && (
                <p className="text-[11px] text-destructive/80 font-medium text-center animate-in fade-in slide-in-from-top-1 duration-200">
                  Diese Pause überschneidet sich mit einer bestehenden Pause.
                </p>
              )}

              <Button
                type="submit"
                className={cn(
                  'w-full h-12 text-base bg-primary hover:bg-primary/90 text-primary-foreground gap-2',
                  (!startStr || !endStr || isTimeOrderInvalid || isBeforeStart || hasOverlap || submitting) && 'opacity-50',
                )}
                disabled={!startStr || !endStr || isTimeOrderInvalid || isBeforeStart || hasOverlap || submitting}
              >
                {submitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Plus className="h-5 w-5" />
                    Pause hinzufügen
                  </>
                )}
              </Button>
            </form>
          </section>

        </div>
      </DrawerContent>
    </Drawer>
  );
}
