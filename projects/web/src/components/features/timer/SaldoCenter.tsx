import { cn } from '@/lib/utils';
import { RING_COLORS } from '@/lib/ring-geometry';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { WorkdayMessage } from '@/utils/workdayMessages';

interface SaldoCenterProps {
  saldoText: string;
  isOvertime: boolean;
  message?: WorkdayMessage | null;
}

const MESSAGE_COLOR: Record<NonNullable<WorkdayMessage>['type'], string> = {
  urgent:  'text-destructive',
  warning: 'text-orange-500',
  success: 'text-green-500',
  info:    'text-muted-foreground/90',
};

/**
 * Zentrum des Timer-Rings: Saldo-/Überstunden-Anzeige, kontextuelle Statusnachricht.
 */
export function SaldoCenter({ saldoText, isOvertime, message }: SaldoCenterProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none pointer-events-none px-8">
      <Eyebrow size="xs" className="text-muted-foreground/50 mb-2.5">
        {isOvertime ? 'Überstunden' : 'Saldo'}
      </Eyebrow>
      <div
        className={cn(
          'font-bold tabular-nums leading-none tracking-tight',
          'text-[50px] sm:text-[62px]',
        )}
        style={{ color: RING_COLORS.work }}
      >
        {saldoText}
      </div>
      {message && (
        <p
          className={cn(
            'text-[12px] sm:text-[13px] mt-3 font-medium leading-snug text-balance max-w-[58%]',
            MESSAGE_COLOR[message.type],
          )}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
