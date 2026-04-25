import { forwardRef, type ComponentProps, type ReactNode } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface BottomBarActionProps extends Omit<ComponentProps<typeof Button>, 'children' | 'variant'> {
  icon: ReactNode;
  label: string;
}

/**
 * Vertikaler Icon+Label-Button für die mobile BottomBar (Feierabend, Pausen-Trigger, …).
 * Forwarded Ref, damit Radix/Vaul-`asChild`-Trigger funktionieren.
 */
export const BottomBarAction = forwardRef<HTMLButtonElement, BottomBarActionProps>(
  function BottomBarAction({ icon, label, className, ...props }, ref) {
    return (
      <Button
        ref={ref}
        variant="ghost"
        className={cn(
          'flex flex-col gap-1 h-auto py-2.5 px-5',
          'text-muted-foreground hover:text-primary hover:bg-transparent',
          className,
        )}
        {...props}
      >
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </Button>
    );
  },
);
