import { forwardRef } from 'react';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomBarAction } from '@/components/ui/bottom-bar-action';

interface BreaksTriggerProps {
  /** Desktop-Variante: Pill-Button mit Icon + Label. Mobile: vertikal im BottomBar. */
  desktopMode?: boolean;
}

export const BreaksTrigger = forwardRef<HTMLButtonElement, BreaksTriggerProps>(
  function BreaksTrigger({ desktopMode, ...props }, ref) {
    if (desktopMode) {
      return (
        <Button
          ref={ref}
          variant="ghost"
          className="rounded-full border border-primary text-primary hover:bg-primary/10 hover:text-primary"
          {...props}
        >
          <Coffee className="mr-2 h-4 w-4" /> Pausen
        </Button>
      );
    }
    return (
      <BottomBarAction
        ref={ref}
        icon={<Coffee className="h-6 w-6" />}
        label="Pausen"
        {...props}
      />
    );
  },
);
