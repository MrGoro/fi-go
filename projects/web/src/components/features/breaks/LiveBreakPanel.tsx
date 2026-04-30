import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Square } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { FormError } from '@/components/ui/form-error';
import { SubmitButton } from '@/components/ui/submit-button';
import { parseToTodayDate, isFutureTimeToday, formatBreakDuration } from '@/lib/time';
import { useElapsedMinutes } from '@/hooks/useElapsedMinutes';

interface LiveBreakPanelProps {
  liveBreakStart: Date;
  workdayStartTime: Date;
  onEnd: (endTime: Date) => Promise<void>;
}

export function LiveBreakPanel({ liveBreakStart, workdayStartTime, onEnd }: LiveBreakPanelProps) {
  const [endStr, setEndStr] = useState(format(new Date(), 'HH:mm'));
  const [loading, setLoading] = useState(false);
  const elapsedMin = useElapsedMinutes(liveBreakStart);

  const parsedEnd = endStr ? parseToTodayDate(endStr) : null;
  const isBeforeStart  = !!(parsedEnd && parsedEnd <= liveBreakStart);
  const isBeforeWorkday = !!(parsedEnd && parsedEnd < workdayStartTime);
  const isInFuture = isFutureTimeToday(endStr);
  const isInvalid = !endStr || isBeforeStart || isBeforeWorkday || isInFuture;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isInvalid || loading || !parsedEnd) return;

    setLoading(true);
    try {
      await onEnd(parsedEnd);
    } catch (error) {
      console.error('End live break error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <Eyebrow as="h3">Pause läuft</Eyebrow>

      <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 dark:border-orange-800 dark:bg-orange-950/30">
        <div className="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
          <span className="text-sm font-medium">
            Seit {format(liveBreakStart, 'HH:mm')} – {formatBreakDuration(elapsedMin)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium pl-1">Beendet um</label>
          <Input
            type="time"
            value={endStr}
            onChange={e => setEndStr(e.target.value)}
            required
            className="h-12 text-lg text-center font-mono px-1"
          />
        </div>

        {isBeforeStart   && <FormError>Endzeit muss nach {format(liveBreakStart, 'HH:mm')} liegen.</FormError>}
        {isBeforeWorkday && <FormError>Endzeit darf nicht vor Dienstbeginn liegen.</FormError>}
        {isInFuture      && <FormError>Die Endzeit darf nicht in der Zukunft liegen.</FormError>}

        <SubmitButton
          type="submit"
          disabled={isInvalid}
          loading={loading}
          className="h-12"
          variant="outline"
        >
          <Square className="h-5 w-5" />
          Pause beenden
        </SubmitButton>
      </form>
    </section>
  );
}
