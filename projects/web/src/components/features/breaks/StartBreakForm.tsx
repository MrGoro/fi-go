import { useState, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Play } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { FormError } from '@/components/ui/form-error';
import { SubmitButton } from '@/components/ui/submit-button';
import { parseToTodayDate, isFutureTimeToday } from '@/lib/time';

interface StartBreakFormProps {
  workdayStartTime: Date;
  onStart: (startTime: Date) => Promise<void>;
}

export function StartBreakForm({ workdayStartTime, onStart }: StartBreakFormProps) {
  const [startStr, setStartStr] = useState(format(new Date(), 'HH:mm'));
  const [loading, setLoading] = useState(false);

  const parsedStart = startStr ? parseToTodayDate(startStr) : null;
  const isBeforeWorkday = !!(parsedStart && parsedStart < workdayStartTime);
  const isInFuture = isFutureTimeToday(startStr);
  const isInvalid = !startStr || isBeforeWorkday || isInFuture;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (isInvalid || loading || !parsedStart) return;

    setLoading(true);
    try {
      await onStart(parsedStart);
    } catch (error) {
      console.error('Start live break error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="space-y-3">
      <Eyebrow as="h3">Pause starten</Eyebrow>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-medium pl-1">Begonnen um</label>
          <Input
            type="time"
            value={startStr}
            onChange={e => setStartStr(e.target.value)}
            required
            className="h-12 text-lg text-center font-mono px-1"
          />
        </div>

        {isBeforeWorkday && <FormError>Pause kann nicht vor Dienstbeginn ({format(workdayStartTime, 'HH:mm')}) liegen.</FormError>}
        {isInFuture && <FormError>Die Startzeit darf nicht in der Zukunft liegen.</FormError>}

        <SubmitButton
          type="submit"
          disabled={isInvalid}
          loading={loading}
          className="h-12"
        >
          <Play className="h-5 w-5" />
          Pause starten
        </SubmitButton>
      </form>
    </section>
  );
}
