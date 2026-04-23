import { useState, type ReactNode } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SURFACE_CLASS } from '@/components/ui/surface';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

type StatusKind = 'iosInstall' | 'denied' | 'active' | 'paused' | 'inactive';

interface StatusView {
  kind: StatusKind;
  icon: ReactNode;
  /** Kleine Kreis-Badge rechts oben am Bell-Icon, `null` = keine Badge. */
  badgeColor: string | null;
  title: string;
  description: string;
  /** Badge-Text in der Popover-Kopfzeile */
  pillLabel: 'Aktiv' | 'Pausiert' | 'Inaktiv';
  /** Ob diese Status-Variante als "aktiv" hervorgehoben wird (Icon+Pill) */
  isActive: boolean;
}

interface PushState {
  isIosInstallRequired: boolean;
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  isOptedIn: boolean;
}

function resolveStatus(state: PushState): StatusView {
  if (state.isIosInstallRequired) {
    return {
      kind: 'iosInstall',
      icon: <Bell className="h-4 w-4 text-muted-foreground/40" />,
      badgeColor: 'bg-blue-500',
      title: 'Installation erforderlich',
      description:
        'Auf iOS müssen Web-Apps zum Home-Bildschirm hinzugefügt werden, um Benachrichtigungen zu senden.',
      pillLabel: 'Inaktiv',
      isActive: false,
    };
  }
  if (state.permission === 'denied') {
    return {
      kind: 'denied',
      icon: <BellOff className="h-4 w-4 text-muted-foreground/30" />,
      badgeColor: null,
      title: 'Blockiert',
      description:
        'Benachrichtigungen wurden im Browser blockiert. Du kannst sie in den Browser-Einstellungen wieder freischalten.',
      pillLabel: 'Inaktiv',
      isActive: false,
    };
  }
  if (state.permission === 'granted' && state.isOptedIn) {
    return {
      kind: 'active',
      icon: <Bell className="h-4 w-4 text-primary" />,
      badgeColor: 'bg-green-500',
      title: 'Aktiviert',
      description: 'Du erhältst Benachrichtigungen, z.B. wenn du die 10-Stunden-Grenze erreichst.',
      pillLabel: 'Aktiv',
      isActive: true,
    };
  }
  if (state.permission === 'granted' && !state.isOptedIn) {
    return {
      kind: 'paused',
      icon: <Bell className="h-4 w-4 text-muted-foreground/60" />,
      badgeColor: 'bg-orange-500',
      title: 'Pausiert',
      description: 'Die Berechtigung ist erteilt, aber Benachrichtigungen sind aktuell deaktiviert.',
      pillLabel: 'Pausiert',
      isActive: false,
    };
  }
  return {
    kind: 'inactive',
    icon: <Bell className="h-4 w-4 text-muted-foreground/60" />,
    badgeColor: null,
    title: 'Inaktiv',
    description: 'Aktiviere Benachrichtigungen, um über wichtige Zeitlimits informiert zu werden.',
    pillLabel: 'Inaktiv',
    isActive: false,
  };
}

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

  const view = resolveStatus({
    isIosInstallRequired,
    permission: permission as PushState['permission'],
    isOptedIn,
  });

  const handleRequest = () => {
    requestPermission();
    setOpen(false);
  };
  const handleDeactivate = () => {
    deactivateNotifications();
    setOpen(false);
  };

  const action = renderAction(view.kind, {
    onRequest: handleRequest,
    onDeactivate: handleDeactivate,
    loading: isLoading,
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

interface ActionCallbacks {
  onRequest: () => void;
  onDeactivate: () => void;
  loading: boolean;
}

function renderAction(kind: StatusKind, cb: ActionCallbacks): ReactNode {
  switch (kind) {
    case 'iosInstall':
      return (
        <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-[10px] text-primary font-medium">
            <Smartphone className="h-3 w-3" />
            <span>Anleitung für iOS:</span>
          </div>
          <p className="text-[10px] text-muted-foreground">
            Tippe auf das <span className="text-foreground font-semibold">Teilen-Icon</span> (Viereck mit Pfeil) und wähle <span className="text-foreground font-semibold">"Zum Home-Bildschirm"</span>.
          </p>
        </div>
      );
    case 'denied':
      return null;
    case 'active':
      return (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2 text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/30"
          onClick={cb.onDeactivate}
        >
          Ausschalten
        </Button>
      );
    case 'paused':
      return (
        <Button variant="default" size="sm" className="w-full mt-2 text-xs h-8" onClick={cb.onRequest} disabled={cb.loading}>
          {cb.loading ? 'Wird aktiviert...' : 'Wieder aktivieren'}
        </Button>
      );
    case 'inactive':
      return (
        <Button variant="default" size="sm" className="w-full mt-2 text-xs h-8" onClick={cb.onRequest} disabled={cb.loading}>
          {cb.loading ? 'Wird aktiviert...' : 'Aktivieren'}
        </Button>
      );
  }
}
