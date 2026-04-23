import { useState } from 'react';
import { Bell, BellOff, Smartphone } from 'lucide-react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    deactivateNotifications 
  } = usePushNotifications(userId);

  // Define config calculation inside the render to avoid hook order issues if it were a component
  let icon = <Bell className="h-4 w-4 text-muted-foreground/60" />;
  let badge = null;
  let title = "Inaktiv";
  let description = "Aktiviere Benachrichtigungen, um über wichtige Zeitlimits informiert zu werden.";
  let action = (
    <Button 
      variant="default" 
      size="sm" 
      className="w-full mt-2 text-xs h-8"
      onClick={() => {
        requestPermission();
        setOpen(false);
      }}
      disabled={isLoading}
    >
      {isLoading ? "Wird aktiviert..." : "Aktivieren"}
    </Button>
  );

  if (isIosInstallRequired) {
    icon = <Bell className="h-4 w-4 text-muted-foreground/40" />;
    badge = <div className="absolute top-0 right-0 w-2 h-2 bg-blue-500 rounded-full border-2 border-background" />;
    title = "Installation erforderlich";
    description = "Auf iOS müssen Web-Apps zum Home-Bildschirm hinzugefügt werden, um Benachrichtigungen zu senden.";
    action = (
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
  } else if (permission === 'denied') {
    icon = <BellOff className="h-4 w-4 text-muted-foreground/30" />;
    title = "Blockiert";
    description = "Benachrichtigungen wurden im Browser blockiert. Du kannst sie in den Browser-Einstellungen wieder freischalten.";
    action = null;
  } else if (permission === 'granted' && isOptedIn) {
    icon = <Bell className="h-4 w-4 text-primary" />;
    badge = <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border-2 border-background" />;
    title = "Aktiviert";
    description = "Du erhältst Benachrichtigungen, z.B. wenn du die 10-Stunden-Grenze erreichst.";
    action = (
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full mt-2 text-xs h-8 border-destructive/20 text-destructive hover:bg-destructive/5 hover:border-destructive/30"
        onClick={() => {
          deactivateNotifications();
          setOpen(false);
        }}
      >
        Ausschalten
      </Button>
    );
  } else if (permission === 'granted' && !isOptedIn) {
    icon = <Bell className="h-4 w-4 text-muted-foreground/60" />;
    badge = <div className="absolute top-0 right-0 w-2 h-2 bg-orange-500 rounded-full border-2 border-background" />;
    title = "Pausiert";
    description = "Die Berechtigung ist erteilt, aber Benachrichtigungen sind aktuell deaktiviert.";
    action = (
      <Button 
        variant="default" 
        size="sm" 
        className="w-full mt-2 text-xs h-8"
        onClick={() => {
          requestPermission();
          setOpen(false);
        }}
        disabled={isLoading}
      >
        Wieder aktivieren
      </Button>
    );
  }

  // Early return ONLY after all hooks
  if (isUnsupported) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className="h-9 w-9 rounded-full transition-all duration-200 text-muted-foreground hover:bg-accent hover:text-foreground data-[state=open]:bg-accent data-[state=open]:text-foreground flex items-center justify-center cursor-pointer outline-none"
        aria-label="Benachrichtigungseinstellungen"
      >
        <div className="relative">
          {icon}
          {badge}
        </div>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-72 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-4 z-50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-muted-foreground/50 uppercase tracking-widest">Benachrichtigungen</span>
            <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${permission === 'granted' && isOptedIn ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
              {permission === 'granted' && isOptedIn ? 'Aktiv' : (permission === 'granted' ? 'Pausiert' : 'Inaktiv')}
            </div>
          </div>

          <div className="bg-accent/30 rounded-xl p-3 border border-border/50">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${permission === 'granted' && isOptedIn ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {icon}
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold text-foreground leading-none">{title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {description}
                </p>
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
