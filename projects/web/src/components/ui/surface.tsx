import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { SURFACE_CLASS, type SurfaceVariant } from './surface-classes';

interface SurfaceProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SurfaceVariant;
}

/**
 * Glassmorphism-Oberfläche. Vereinheitlicht das
 * `bg-white/80 backdrop-blur-xl border …`-Muster, das sich vorher durch
 * AppBar, BottomBar, Info-Card, ProfileMenu, PushPopover, Toaster und
 * Loading-Skeleton zog.
 *
 * Wenn das Zielelement nicht `<div>` sein kann (z.B. Popover-Popup von
 * base-ui, das kein `asChild` unterstützt), importiere stattdessen
 * `SURFACE_CLASS` aus `./surface-classes`.
 */
export function Surface({ variant = 'card', className, ...props }: SurfaceProps) {
  return (
    <div
      data-slot="surface"
      data-variant={variant}
      className={cn(SURFACE_CLASS[variant], className)}
      {...props}
    />
  );
}
