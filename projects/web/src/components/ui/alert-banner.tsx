import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Tone = 'warning' | 'destructive';

const TONE_CLASS: Record<Tone, string> = {
  warning:
    'bg-orange-500/12 border-orange-500/30 text-orange-700 font-semibold ' +
    'animate-in slide-in-from-top-2 duration-300 dark:text-orange-300',
  destructive:
    'bg-destructive/12 border-destructive/40 text-destructive font-bold animate-pulse',
};

interface AlertBannerProps {
  tone: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Voll-breite Warn-/Fehler-Leiste — Überschreitungs- und Annäherungs-Warnungen
 * auf dem Timer-Screen.
 */
export function AlertBanner({ tone, icon, children, className }: AlertBannerProps) {
  return (
    <div
      role="alert"
      className={cn(
        'w-full max-w-md flex items-center gap-2.5 px-4 py-3 rounded-2xl text-sm',
        'border backdrop-blur-md shadow-sm',
        TONE_CLASS[tone],
        className,
      )}
    >
      {icon && <span className="text-base leading-none">{icon}</span>}
      <span>{children}</span>
    </div>
  );
}
