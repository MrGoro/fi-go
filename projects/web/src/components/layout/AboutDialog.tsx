import { Dialog } from '@/components/ui/dialog';
import { Eyebrow } from '@/components/ui/eyebrow';
import {
  WORK_TIME_TARGET_HOURS,
  WORK_TIME_TARGET_MINUTES,
  BREAK_RULE_1_THRESHOLD_MINUTES,
  BREAK_RULE_1_MIN_BREAK_MINUTES,
  BREAK_RULE_2_THRESHOLD_MINUTES,
  BREAK_RULE_2_MIN_BREAK_MINUTES,
  MAX_WORK_LIMIT_MINUTES,
} from '@figo/shared';

interface AboutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AboutDialog({ open, onOpenChange }: AboutDialogProps) {
  const targetFormatted = `${WORK_TIME_TARGET_HOURS}:${String(WORK_TIME_TARGET_MINUTES).padStart(2, '0')}`;
  const warningMinutes = MAX_WORK_LIMIT_MINUTES - 30;
  const warningHours   = Math.floor(warningMinutes / 60);
  const warningMins    = warningMinutes % 60;
  const warningFormatted = `${warningHours}:${String(warningMins).padStart(2, '0')}`;

  // Fallback for version info if build-time injection fails
  const versionInfo = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : {
    version:   '1.0.0',
    revision:  'dev',
    branch:    'local',
    buildTime: new Date().toISOString(),
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Über fi go!">
      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <p>
          Ein moderner Arbeitszeitrechner, optimiert für Schnelligkeit und Benutzerfreundlichkeit.
        </p>

        <div className="space-y-2">
          <h4 className="font-semibold text-foreground">Funktionsweise</h4>
          <ul className="list-disc pl-4 space-y-1">
            <li>Login via Firebase Auth</li>
            <li>Echtzeit-Synchronisierung</li>
            <li>Automatische Pausenberechnung</li>
            <li>PWA Unterstützung (Offline fähig)</li>
          </ul>
        </div>

        <div className="bg-muted/50 rounded-xl p-4 border border-border/50">
          <Eyebrow as="h4" className="block text-foreground mb-3 leading-none">Arbeitszeitregeln</Eyebrow>
          <div className="grid grid-cols-2 gap-y-2 text-xs">
            <span>Soll-Arbeitszeit:</span>
            <span className="font-medium text-foreground">{targetFormatted} Stunden</span>

            <span>Pause 1:</span>
            <span className="font-medium text-foreground">
              {BREAK_RULE_1_MIN_BREAK_MINUTES} Min (nach {BREAK_RULE_1_THRESHOLD_MINUTES / 60}h)
            </span>

            <span>Pause 2:</span>
            <span className="font-medium text-foreground">
              {BREAK_RULE_2_MIN_BREAK_MINUTES} Min (nach {BREAK_RULE_2_THRESHOLD_MINUTES / 60}h)
            </span>

            <span>Warnung:</span>
            <span className="font-medium text-foreground">vor 10h-Grenze (ab {warningFormatted}h)</span>
          </div>
        </div>

        <div className="bg-muted/30 rounded-xl p-4 border border-border/30">
          <Eyebrow as="h4" className="block text-foreground/70 mb-3 leading-none">Version</Eyebrow>
          <div className="grid grid-cols-2 gap-y-2 text-[10px] sm:text-xs">
            <span className="opacity-60">Version:</span>
            <span className="font-medium truncate">{versionInfo.version}</span>

            <span className="opacity-60">Revision:</span>
            <span className="font-mono">{versionInfo.revision}</span>

            <span className="opacity-60">Branch:</span>
            <span className="font-medium">{versionInfo.branch}</span>

            <span className="opacity-60">Build Zeit:</span>
            <span className="font-medium truncate">{new Date(versionInfo.buildTime).toLocaleString('de-DE')}</span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
