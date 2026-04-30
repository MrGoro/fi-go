/**
 * Parst "HH:MM" zu einem Date-Objekt mit dem heutigen Datum und gesetzten
 * Stunden/Minuten. Sekunden und Millisekunden werden auf 0 gesetzt.
 */
export function parseToTodayDate(timeStr: string): Date {
  const [h, m] = timeStr.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

/** True, wenn `timeStr` (HH:MM) heute in der Zukunft liegt. */
export function isFutureTimeToday(timeStr: string): boolean {
  if (!timeStr) return false;
  return parseToTodayDate(timeStr) > new Date();
}

/** Formatiert eine Dauer in Minuten als "H:MM Std." (>= 60 min) oder "M Min." */
export function formatBreakDuration(totalMinutes: number): string {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, '0')} Std.` : `${m} Min.`;
}
