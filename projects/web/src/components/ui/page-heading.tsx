import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface PageHeadingProps {
  title: ReactNode;
  subtitle?: ReactNode;
  className?: string;
}

/**
 * Step-/Page-Heading: h1 + optionaler Subtitle. Übernimmt die
 * Einstiegs-Animation (fade-in slide-in-from-bottom) der Screens.
 */
export function PageHeading({ title, subtitle, className }: PageHeadingProps) {
  return (
    <div className={cn('mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300', className)}>
      <h1 className="text-[22px] font-bold tracking-tight text-foreground">{title}</h1>
      {subtitle && (
        <p className="text-sm text-muted-foreground mt-1.5">{subtitle}</p>
      )}
    </div>
  );
}
