export type SurfaceVariant = 'card' | 'bar' | 'popover' | 'toast';

/**
 * Glassmorphism-Klassenstack pro Variante. Nur über `Surface` konsumieren,
 * außer das Zielelement kann keine `<div>` sein (z.B. base-ui-Popup ohne
 * `asChild`) — dann direkt als className verwenden.
 */
export const SURFACE_CLASS: Record<SurfaceVariant, string> = {
  // Info-Card / Saldo-Card
  card:
    'rounded-2xl bg-card/80 backdrop-blur-xl border border-border ' +
    'shadow-[0_8px_32px_-6px_hsl(var(--primary)/0.14),0_2px_8px_-2px_hsl(var(--foreground)/0.07)]',

  // Mobile Bottom-Bar / App-Bar
  bar:
    'rounded-2xl bg-card/80 backdrop-blur-xl border border-primary/10',

  // Popover / Dropdown-Menu
  popover:
    'rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl',

  // Toast
  toast:
    'rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-lg',
};
