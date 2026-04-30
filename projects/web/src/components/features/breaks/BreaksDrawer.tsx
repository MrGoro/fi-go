import { useRef, useState } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Coffee } from 'lucide-react';
import { BreaksTrigger } from './BreaksTrigger';
import { BreaksList } from './BreaksList';
import { BreaksAddForm } from './BreaksAddForm';
import { StartBreakForm } from './StartBreakForm';
import { LiveBreakPanel } from './LiveBreakPanel';
import type { FirebaseBreakRecord } from '@/hooks/useSessionData';

interface BreaksDrawerProps {
  breaks: FirebaseBreakRecord[];
  onAddBreak: (start: Date, end: Date) => Promise<void>;
  onRemoveBreak: (id: string) => void;
  startTime: Date;
  liveBreakStart: Date | null;
  onStartLiveBreak: (startTime: Date) => Promise<void>;
  onEndLiveBreak: (endTime: Date) => Promise<void>;
  desktopMode?: boolean;
}

export function BreaksDrawer({ breaks, onAddBreak, onRemoveBreak, startTime, liveBreakStart, onStartLiveBreak, onEndLiveBreak, desktopMode }: BreaksDrawerProps) {
  const [open, setOpen] = useState(false);
  const focusRef = useRef<HTMLDivElement>(null);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <BreaksTrigger desktopMode={desktopMode} liveBreakRunning={liveBreakStart !== null} />
      </DrawerTrigger>

      <DrawerContent
        className="max-w-md mx-auto"
        onOpenAutoFocus={e => {
          // Prevent focus landing on any input (avoids iOS time-picker on open).
          // Instead move focus to the inert container so aria-hidden on #root stays valid.
          e.preventDefault();
          focusRef.current?.focus();
        }}
      >
        <DrawerHeader className="pb-3">
          <DrawerTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Coffee className="h-6 w-6 text-primary" /> Pausen
          </DrawerTitle>
          <DrawerDescription className="text-center">
            Pausenzeiten erfassen oder löschen.
          </DrawerDescription>
        </DrawerHeader>

        {/* tabIndex={-1}/outline-none: programmatic focus target, not in tab order */}
        <div ref={focusRef} tabIndex={-1} className="flex-1 min-h-0 overflow-y-auto px-4 pb-8 flex flex-col gap-6 outline-none">
          {liveBreakStart ? (
            <LiveBreakPanel
              liveBreakStart={liveBreakStart}
              workdayStartTime={startTime}
              onEnd={onEndLiveBreak}
            />
          ) : (
            <StartBreakForm
              workdayStartTime={startTime}
              onStart={onStartLiveBreak}
            />
          )}
          <BreaksList breaks={breaks} onRemove={onRemoveBreak} />
          <BreaksAddForm startTime={startTime} breaks={breaks} onAdd={onAddBreak} liveBreakRunning={liveBreakStart !== null} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
