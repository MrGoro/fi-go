import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky Glass-Header-Leiste (h-14, `<header>`-Semantik) — gemeinsamer
 * Shell für AppBar und LoadingScreen-Skeleton. Enthält bewusst keine
 * inhaltlichen Slots; die Aufrufer rendern Logo/Aktionen als children.
 */
export function AppBarShell({ className, children, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        'h-14 shrink-0 w-full flex items-center px-4 sm:px-6',
        'bg-background/80 backdrop-blur-xl border-b border-border/70',
        'sticky top-0 z-50 shadow-sm',
        className,
      )}
      {...props}
    >
      {children}
    </header>
  );
}
