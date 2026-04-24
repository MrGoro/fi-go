import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Eyebrow } from './eyebrow';

const FIELD_BASE_CLASS =
  'w-full h-13 rounded-2xl border border-[rgba(229,23,63,0.2)] bg-white/90 ' +
  'shadow-[0_2px_10px_rgba(0,0,0,0.07)] outline-none ' +
  'placeholder:text-muted-foreground/40 ' +
  'transition-all duration-150 ' +
  'focus:border-[rgba(229,23,63,0.4)] focus:ring-3 focus:ring-primary/10 focus:bg-white ' +
  'dark:bg-neutral-900 dark:border-neutral-800 dark:focus:bg-neutral-950';

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  /** Icon links im Eingabefeld (z.B. Smartphone, KeyRound, Clock). */
  iconStart?: ReactNode;
  /** Element rechts im Eingabefeld (z.B. klickbare Clock-Button). */
  iconEnd?: ReactNode;
  /** Overrides für das reine Input-Element (z.B. Text-Zentrierung, Tracking). */
  inputClassName?: string;
  /** Wrapper um das Feld inkl. Label — an äußerem <div> angewandt. */
  wrapperClassName?: string;
}

/**
 * App-weites Textfeld im "Pill"-Design (h-13, rounded-2xl, primary-tinted border).
 * Ersetzt die mehrfach kopierten Inline-<input>-Blöcke in Login/Input/BreaksDrawer.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, iconStart, iconEnd, className, inputClassName, wrapperClassName, ...props },
  ref,
) {
  return (
    <div className={wrapperClassName}>
      {label && (
        <Eyebrow as="label" size="md" className="block text-muted-foreground mb-2">
          {label}
        </Eyebrow>
      )}
      <div className={cn('relative', className)}>
        {iconStart && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50">
            {iconStart}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            FIELD_BASE_CLASS,
            iconStart ? 'pl-10' : 'px-4',
            iconEnd ? 'pr-11' : iconStart ? 'pr-4' : '',
            inputClassName,
          )}
          {...props}
        />
        {iconEnd && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {iconEnd}
          </span>
        )}
      </div>
    </div>
  );
});
