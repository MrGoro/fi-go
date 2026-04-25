import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FormErrorProps {
  children: ReactNode;
  /**
   * `inline` (default): schlanke, mittig zentrierte Fehlermeldung unter einem Feld.
   * `banner`: gefüllter Hintergrund, links-ausgerichtet — für Top-Level-Formularfehler.
   */
  variant?: 'inline' | 'banner';
  className?: string;
}

export function FormError({ children, variant = 'inline', className }: FormErrorProps) {
  if (variant === 'banner') {
    return (
      <div
        role="alert"
        className={cn(
          'flex items-start gap-2 bg-destructive/10 text-destructive text-xs font-medium rounded-xl px-3 py-2.5',
          'animate-in fade-in slide-in-from-top-1 duration-200',
          className,
        )}
      >
        {children}
      </div>
    );
  }
  return (
    <p
      role="alert"
      className={cn(
        'text-[11px] text-destructive/80 font-medium text-center',
        'animate-in fade-in slide-in-from-top-1 duration-200',
        className,
      )}
    >
      {children}
    </p>
  );
}
