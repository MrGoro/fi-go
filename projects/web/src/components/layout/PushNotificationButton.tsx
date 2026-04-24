import { useState } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SURFACE_CLASS } from '@/components/ui/surface-classes';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';
import {
  resolvePushStatus,
  renderPushAction,
  type PushState,
} from './pushStatusView';

interface PushNotificationButtonProps {
  userId: string | null;
}

export function PushNotificationButton({ userId }: PushNotificationButtonProps) {
  const [open, setOpen] = useState(false);
  const {
    permission,
    isLoading,
    isIosInstallRequired,
    isUnsupported,
    isOptedIn,
    requestPermission,
    deactivateNotifications,
  } = usePushNotifications(userId);

  if (isUnsupported) return null;

  const view = resolvePushStatus({
    isIosInstallRequired,
    permission: permission as PushState['permission'],
    isOptedIn,
  });

  const action = renderPushAction(view.kind, {
    onRequest:    () => { requestPermission();     setOpen(false); },
    onDeactivate: () => { deactivateNotifications(); setOpen(false); },
    loading:      isLoading,
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="h-9 w-9 rounded-full transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground flex items-center justify-center cursor-pointer outline-none"
        aria-label="Benachrichtigungseinstellungen"
      >
        <div className="relative">
          {view.icon}
          {view.badgeColor && (
            <div className={cn('absolute top-0 right-0 w-2 h-2 rounded-full border-2 border-background', view.badgeColor)} />
          )}
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className={cn(SURFACE_CLASS.popover, 'w-72 p-4 z-50')}>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <Eyebrow className="text-muted-foreground/50">Benachrichtigungen</Eyebrow>
            <div
              className={cn(
                'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider',
                view.isActive ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground',
              )}
            >
              {view.pillLabel}
            </div>
          </div>

          <div className="bg-accent/30 rounded-xl p-3 border border-border/50">
            <div className="flex items-start gap-3">
              <div className={cn('p-2 rounded-lg', view.isActive ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                {view.icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground leading-none">{view.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">{view.description}</p>
              </div>
            </div>

            {action}
          </div>

          <div className="px-1 py-1">
            <p className="text-[10px] text-muted-foreground/60 leading-tight">
              Wir nutzen Web-Push, um dich über Arbeitszeitgrenzen zu informieren, auch wenn die App im Hintergrund läuft.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
