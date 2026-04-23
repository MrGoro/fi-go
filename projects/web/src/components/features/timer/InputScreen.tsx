import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Clock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputScreenProps {
  onStart: (date: Date) => void;
  loading: boolean;
}

export default function InputScreen({ onStart, loading: parentLoading }: InputScreenProps) {
  const [timeStr, setTimeStr] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  const loading = parentLoading || localLoading;
  const isFutureTime = !!(timeStr && (() => {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d > new Date();
  })());

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

  const handleStartCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!timeStr || loading) return;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);

    setLocalLoading(true);
    try {
      await onStart(date);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
      <div className="w-full max-w-[340px]">

        {/* Heading */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
          <h1 className="text-[22px] font-bold tracking-tight text-foreground">
            Arbeitstag starten
          </h1>
          <p className="text-sm text-muted-foreground mt-1.5">
            Wann hast du heute angefangen?
          </p>
        </div>

        <form
          onSubmit={handleStartCustom}
          className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
        >
          {/* Time input */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
              Startzeit
            </label>
            <div className="relative">
              <input
                type="time"
                value={timeStr}
                onChange={(e) => setTimeStr(e.target.value)}
                required
                disabled={loading}
                className={cn(
                  'w-full h-13 rounded-2xl border border-[rgba(229,23,63,0.2)] bg-white/90',
                  'px-4 pr-11 text-center text-2xl tracking-[0.08em] font-mono outline-none',
                  'shadow-[0_2px_10px_rgba(0,0,0,0.07)]',
                  'transition-all duration-150',
                  'focus:border-[rgba(229,23,63,0.4)] focus:ring-3 focus:ring-primary/10 focus:bg-white',
                  'dark:bg-neutral-900 dark:border-neutral-800 dark:focus:bg-neutral-950',
                  '[&::-webkit-calendar-picker-indicator]:hidden',
                  '[&::-webkit-calendar-picker-indicator]:opacity-0',
                  '[&::-webkit-calendar-picker-indicator]:w-0'
                )}
              />
              <button
                type="button"
                onClick={() => setTimeStr(format(new Date(), 'HH:mm'))}
                disabled={loading}
                title="Aktuelle Zeit"
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-primary transition-colors disabled:pointer-events-none"
              >
                <Clock className="h-4 w-4" />
              </button>
            </div>
            {isFutureTime && (
              <p className="text-[11px] text-destructive/80 font-medium text-center mt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                Die Startzeit darf nicht in der Zukunft liegen.
              </p>
            )}
          </div>

          {/* Primary: submit with custom time */}
          <button
            type="submit"
            disabled={loading || !timeStr || isFutureTime}
            className={cn(
              'w-full h-13 rounded-2xl font-semibold text-[15px]',
              'bg-primary text-white',
              'flex items-center justify-center gap-1.5',
              'transition-all duration-150',
              'hover:brightness-110',
              'hover:shadow-[0_6px_20px_oklch(0.510_0.230_22_/_0.35)]',
              'active:scale-[0.98] active:brightness-95',
              'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30'
            )}
          >
            {loading
              ? <Loader2 className="h-5 w-5 animate-spin" />
              : 'Startzeit eintragen'
            }
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-border flex-1" />
            <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
              oder
            </span>
            <div className="h-px bg-border flex-1" />
          </div>

          {/* Secondary: clock in now */}
          <button
            type="button"
            onClick={handleStartNow}
            disabled={loading}
            className={cn(
              'w-full h-13 rounded-2xl font-semibold text-[15px]',
              'border border-[#E5173F] bg-white text-[#E5173F]',
              'shadow-[0_2px_10px_rgba(0,0,0,0.07)]',
              'flex items-center justify-center',
              'transition-all duration-150',
              'hover:bg-[#E5173F]/5',
              'active:scale-[0.98]',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              'dark:bg-neutral-900 dark:border-primary dark:text-primary dark:hover:bg-primary/10',
              'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30'
            )}
          >
            Jetzt einstempeln
          </button>
        </form>
      </div>
    </div>
  );
}
