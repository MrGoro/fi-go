import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { FormError } from '@/components/ui/form-error';
import { SubmitButton } from '@/components/ui/submit-button';
import { parseToTodayDate } from '@/lib/time';
import type { FirebaseBreakRecord } from '@/hooks/useSessionData';

interface BreaksAddFormProps {
  startTime: Date;
  breaks: FirebaseBreakRecord[];
  onAdd: (start: Date, end: Date) => Promise<void>;
  liveBreakRunning?: boolean;
}

export function BreaksAddForm({ startTime, breaks, onAdd, liveBreakRunning }: BreaksAddFormProps) {
  if (liveBreakRunning) {
    return (
      <section className="space-y-3">
        <Eyebrow as="h3">Neue Pause erfassen</Eyebrow>
        <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 text-center dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
          Beende zuerst die laufende Pause.
        </div>
      </section>
    );
  }
  const [startStr, setStartStr] = useState('');
  const [endStr, setEndStr] = useState('');
  const [loading, setLoading] = useState(false);

  const isOrderInvalid = !!(startStr && endStr && parseToTodayDate(endStr) <= parseToTodayDate(startStr));
  const isBeforeStart  = !!(startStr && parseToTodayDate(startStr) < startTime);
  const hasOverlap     = !!(startStr && endStr && !isOrderInvalid && !isBeforeStart && (() => {
    const ns = parseToTodayDate(startStr).getTime();
    const ne = parseToTodayDate(endStr).getTime();
    return breaks.some(b => ns < b.end.getTime() && ne > b.start.getTime());
  })());

  const isInvalid = !startStr || !endStr || isOrderInvalid || isBeforeStart || hasOverlap;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isInvalid || loading) return;

    setLoading(true);
    try {
      await onAdd(parseToTodayDate(startStr), parseToTodayDate(endStr));
      setStartStr('');
      setEndStr('');
    } catch (error) {
      console.error('Add break error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <Eyebrow as="h3">Neue Pause erfassen</Eyebrow>

      <form onSubmit={handleSubmit} className="space-y-4">
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

        {isOrderInvalid && <FormError>Die Endzeit muss nach der Startzeit liegen.</FormError>}
        {isBeforeStart  && <FormError>Pause kann nicht vor Dienstbeginn ({format(startTime, 'HH:mm')}) liegen.</FormError>}
        {hasOverlap     && <FormError>Diese Pause überschneidet sich mit einer bestehenden Pause.</FormError>}

        <SubmitButton
          type="submit"
          disabled={isInvalid}
          loading={loading}
          className="h-12"
        >
          <Plus className="h-5 w-5" />
          Pause hinzufügen
        </SubmitButton>
      </form>
    </section>
  );
}
