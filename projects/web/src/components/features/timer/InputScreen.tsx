import { useState, useEffect, type FormEvent } from 'react';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';
import { TextField } from '@/components/ui/text-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { FormError } from '@/components/ui/form-error';
import { parseToTodayDate, isFutureTimeToday } from '@/lib/time';

interface InputScreenProps {
  onStart: (date: Date) => void;
  loading: boolean;
}

export default function InputScreen({ onStart, loading: parentLoading }: InputScreenProps) {
  const [timeStr, setTimeStr] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const loading = parentLoading || localLoading;
  const isFuture = isFutureTimeToday(timeStr);

  useEffect(() => {
    setTimeStr(format(new Date(), 'HH:mm'));
  }, []);

  const handleStartNow = async () => {
    if (loading) return;
    setLocalLoading(true);
    try {
      await onStart(new Date());
    } finally {
      setLocalLoading(false);
    }
  };

  const handleStartCustom = async (e: FormEvent) => {
    e.preventDefault();
    if (!timeStr || loading) return;
    setLocalLoading(true);
    try {
      await onStart(parseToTodayDate(timeStr));
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-[340px]">
        <PageHeading title="Arbeitstag starten" subtitle="Wann hast du heute angefangen?" />

        <form
          onSubmit={handleStartCustom}
          className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          <div>
            <TextField
              label="Startzeit"
              type="time"
              value={timeStr}
              onChange={(e) => setTimeStr(e.target.value)}
              required
              disabled={loading}
              inputClassName="text-center text-2xl tracking-[0.08em] font-mono appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:w-0"
              iconEnd={
                <button
                  type="button"
                  onClick={() => setTimeStr(format(new Date(), 'HH:mm'))}
                  disabled={loading}
                  title="Aktuelle Zeit"
                  className="text-muted-foreground/40 hover:text-primary transition-colors disabled:pointer-events-none"
                >
                  <Clock className="h-4 w-4" />
                </button>
              }
            />
            {isFuture && (
              <FormError className="mt-2">
                Die Startzeit darf nicht in der Zukunft liegen.
              </FormError>
            )}
          </div>

          <SubmitButton
            type="submit"
            disabled={!timeStr || isFuture}
            loading={loading}
          >
            Startzeit eintragen
          </SubmitButton>

          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              oder
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          <SubmitButton
            type="button"
            variant="outline"
            onClick={handleStartNow}
            disabled={loading}
          >
            Jetzt einstempeln
          </SubmitButton>
        </form>
      </div>
    </div>
  );
}
