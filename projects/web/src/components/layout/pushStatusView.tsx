import type { ReactNode } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type PushStatusKind = 'iosInstall' | 'denied' | 'active' | 'paused' | 'inactive';

export interface PushStatusView {
  kind: PushStatusKind;
  icon: ReactNode;
  /** Kleine Kreis-Badge rechts oben am Bell-Icon, `null` = keine Badge. */
  badgeColor: string | null;
  title: string;
  description: string;
  /** Badge-Text in der Popover-Kopfzeile */
  pillLabel: 'Aktiv' | 'Pausiert' | 'Inaktiv';
  /** Hervorhebung in Icon + Pill */
  isActive: boolean;
}

export interface PushState {
  isIosInstallRequired: boolean;
  permission: 'default' | 'granted' | 'denied' | 'unsupported';
  isOptedIn: boolean;
}

/**
 * Reine View-Ableitung: Push-State → View-Model. Hat keine Seiteneffekte,
 * keine Hooks — erleichtert das Testen einzelner Varianten ohne React.
 */
export function resolvePushStatus(state: PushState): PushStatusView {
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

export interface PushActionCallbacks {
  onRequest: () => void;
  onDeactivate: () => void;
  loading: boolean;
}

/** Action-Bereich im Popover je nach Status. iOS-Fall rendert Anleitung statt Button. */
export function renderPushAction(kind: PushStatusKind, cb: PushActionCallbacks): ReactNode {
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
