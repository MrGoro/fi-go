import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline';

const VARIANT_CLASS: Record<Variant, string> = {
  primary:
    'bg-primary text-white ' +
    'hover:brightness-110 hover:shadow-[0_6px_20px_oklch(0.510_0.230_22_/_0.35)] ' +
    'active:scale-[0.98] active:brightness-95 ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none',
  outline:
    'border border-[#E5173F] bg-white text-[#E5173F] ' +
    'shadow-[0_2px_10px_rgba(0,0,0,0.07)] ' +
    'hover:bg-[#E5173F]/5 ' +
    'active:scale-[0.98] ' +
    'disabled:opacity-40 disabled:cursor-not-allowed ' +
    'dark:bg-neutral-900 dark:border-primary dark:text-primary dark:hover:bg-primary/10',
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
