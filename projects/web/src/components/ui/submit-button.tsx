import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline';

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-primary text-white ' +
    'hover:brightness-110 hover:shadow-[0_6px_20px_hsl(var(--primary)/0.35)] ' +
    'active:scale-[0.98] active:brightness-95 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none',
  outline:
    'border border-primary bg-card text-primary ' +
    'shadow-[0_2px_10px_hsl(var(--foreground)/0.07)] ' +
    'hover:bg-primary/5 ' +
    'active:scale-[0.98] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed',
};

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: Variant;
  /** Override-Klassen für den inneren <button>. */
  children: ReactNode;
}

/**
 * App-weiter "Pill"-Button (h-13, rounded-2xl) mit Loading-Spinner-Swap.
 * Ersetzt das `PrimaryButton` aus LoginView und diverse Inline-Buttons.
 */
export const SubmitButton = forwardRef<HTMLButtonElement, SubmitButtonProps>(
  function SubmitButton({ loading, disabled, children, className, type = 'button', variant = 'primary', ...props }, ref) {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          'w-full h-13 rounded-2xl font-semibold text-[15px]',
          'flex items-center justify-center gap-1.5',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30',
          VARIANT_CLASS[variant],
          className,
        )}
        {...props}
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : children}
      </button>
    );
  },
);
