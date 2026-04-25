import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Size = 'xs' | 'sm' | 'md';

const SIZE_CLASS: Record<Size, string> = {
  xs: 'text-[9px]  tracking-[0.22em]',
  sm: 'text-[10px] tracking-[0.18em]',
  md: 'text-[11px] tracking-widest',
};

interface EyebrowProps {
  children: ReactNode;
  size?: Size;
  as?: 'span' | 'h3' | 'h4' | 'label' | 'p';
  className?: string;
}

/**
 * Kleines UPPERCASE-Label (Eyebrow) — vereinheitlicht das Muster
 * `font-semibold uppercase tracking-widest text-muted-foreground/50-60`,
 * das in fast jeder Section vorkommt.
 */
export function Eyebrow({ children, size = 'sm', as: Tag = 'span', className }: EyebrowProps) {
  return (
    <Tag
      className={cn(
        'font-semibold uppercase text-muted-foreground/60',
        SIZE_CLASS[size],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
