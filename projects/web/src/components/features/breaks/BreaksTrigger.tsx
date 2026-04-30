import { forwardRef } from 'react';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BottomBarAction } from '@/components/ui/bottom-bar-action';

interface BreaksTriggerProps {
  /** Desktop-Variante: Pill-Button mit Icon + Label. Mobile: vertikal im BottomBar. */
  desktopMode?: boolean;
  /** Zeigt einen Puls-Indikator wenn eine offene Pause läuft. */
  liveBreakRunning?: boolean;
}

export const BreaksTrigger = forwardRef<HTMLButtonElement, BreaksTriggerProps>(
  function BreaksTrigger({ desktopMode, liveBreakRunning, ...props }, ref) {
    const icon = (
      <span className="relative inline-flex">
        <Coffee className={desktopMode ? 'mr-2 h-4 w-4' : 'h-6 w-6'} />
        {liveBreakRunning && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
          </span>
        )}
      </span>
    );

    if (desktopMode) {
      return (
        <Button
          ref={ref}
          variant="ghost"
          className={liveBreakRunning
            ? 'rounded-full border border-orange-400 text-orange-500 hover:bg-orange-500/10 hover:text-orange-500'
            : 'rounded-full border border-primary text-primary hover:bg-primary/10 hover:text-primary'
          }
          {...props}
        >
          {icon} Pausen
        </Button>
      );
    }
    return (
      <BottomBarAction
        ref={ref}
        icon={icon}
        label="Pausen"
        {...props}
      />
    );
  },
);
