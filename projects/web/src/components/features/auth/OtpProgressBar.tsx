import { cn } from '@/lib/utils';

interface OtpProgressBarProps {
  /** Aktuelle Anzahl eingegebener Ziffern */
  filled: number;
  /** Gesamtanzahl erwarteter Ziffern, default 6 */
  length?: number;
}

export function OtpProgressBar({ filled, length = 6 }: OtpProgressBarProps) {
  return (
    <div className="flex gap-1 mt-2 px-0.5">
      {Array.from({ length }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'flex-1 h-0.5 rounded-full transition-all duration-200',
            i < filled ? 'bg-primary' : 'bg-neutral-200 dark:bg-neutral-800',
          )}
        />
      ))}
    </div>
  );
}
