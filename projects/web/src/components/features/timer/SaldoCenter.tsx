import type { ComponentType } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RING_COLORS } from '@/lib/ring-geometry';
import { Eyebrow } from '@/components/ui/eyebrow';
import type { WorkdayMessage, WorkdayMessageSeverity } from './workdayStatus';

interface SaldoCenterProps {
  saldoText: string;
  isOvertime: boolean;
  message?: WorkdayMessage | null;
}

const SEVERITY_ICON: Record<WorkdayMessageSeverity, ComponentType<{ className?: string }>> = {
  urgent:  AlertTriangle,
  warning: AlertCircle,
  success: CheckCircle2,
  info:    Info,
};

const SEVERITY_CLASS: Record<WorkdayMessageSeverity, string> = {
  urgent:  'bg-destructive/12 text-destructive animate-pulse',
  warning: 'bg-orange-500/12 text-orange-700 dark:text-orange-300',
  success: 'bg-green-500/12 text-green-600 dark:text-green-500',
  info:    'bg-muted/60 text-muted-foreground/90',
};

/**
 * Zentrum des Timer-Rings: Saldo-/Überstunden-Anzeige, kontextuelle Statusnachricht.
 */
export function SaldoCenter({ saldoText, isOvertime, message }: SaldoCenterProps) {
  const Icon = message ? SEVERITY_ICON[message.severity] : null;

  return (
    <div className="absolute inset-0 select-none pointer-events-none">
      {/* Saldo pinned to ring center, independent of message */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
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
      </div>
      {/* Message in ring's bottom opening (below arc end-caps at ~y=245 SVG) */}
      {message && Icon && (
        <div className="absolute bottom-[8%] left-0 right-0 flex items-center justify-center px-6">
          <div
            role={message.severity === 'urgent' ? 'alert' : 'status'}
            className={cn(
              'max-w-[75%] flex items-center justify-center gap-1.5',
              'text-[12px] sm:text-[13px] font-medium leading-snug',
              'px-2.5 py-1 rounded-full',
              SEVERITY_CLASS[message.severity],
            )}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" />
            <span className="text-balance">{message.text}</span>
          </div>
        </div>
      )}
    </div>
  );
}
