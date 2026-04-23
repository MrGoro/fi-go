import { forwardRef } from 'react';
import { Coffee } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
          className="rounded-full border border-[#E5173F] text-[#E5173F] hover:bg-[#E5173F]/10 hover:text-[#E5173F]"
          {...props}
        >
          <Coffee className="mr-2 h-4 w-4" /> Pausen
        </Button>
      );
    }
    return (
      <Button
        ref={ref}
        variant="ghost"
        className="flex flex-col gap-1 h-auto py-2.5 px-5 text-[#999] hover:text-[#E5173F] hover:bg-transparent"
        {...props}
      >
        <Coffee className="h-6 w-6" />
        <span className="text-[10px] font-medium uppercase tracking-wider">Pausen</span>
      </Button>
    );
  },
);
