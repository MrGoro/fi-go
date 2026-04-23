import { AlertBanner } from '@/components/ui/alert-banner';
import { MAX_WORK_LIMIT_MINUTES } from '@figo/shared';

interface WorkTimeWarningsProps {
  /** Netto-Arbeitsminuten bis jetzt */
  netMin: number;
}

/**
 * Oberer Banner-Bereich: Warnung ab 30 min vor 10h und Fehlerbanner nach 10h.
 */
export function WorkTimeWarnings({ netMin }: WorkTimeWarningsProps) {
  const minutesToTen = MAX_WORK_LIMIT_MINUTES - netMin;
  const minutesOver  = netMin - MAX_WORK_LIMIT_MINUTES;
  const showWarning  = netMin >= MAX_WORK_LIMIT_MINUTES - 30 && netMin < MAX_WORK_LIMIT_MINUTES;
  const showError    = netMin >= MAX_WORK_LIMIT_MINUTES;

  if (showWarning) {
    return (
      <AlertBanner tone="warning" icon="⚠️">
        Noch <span className="tabular-nums">{minutesToTen}</span> Minuten bis zur 10h-Grenze
      </AlertBanner>
    );
  }
  if (showError) {
    return (
      <AlertBanner tone="destructive" icon="🚫">
        10h-Grenze seit <span className="tabular-nums">{minutesOver}</span> Minuten überschritten
      </AlertBanner>
    );
  }
  return null;
}
