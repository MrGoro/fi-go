export type SurfaceVariant = 'card' | 'bar' | 'popover' | 'toast';

/**
 * Glassmorphism-Klassenstack pro Variante. Nur über `Surface` konsumieren,
 * außer das Zielelement kann keine `<div>` sein (z.B. base-ui-Popup ohne
 * `asChild`) — dann direkt als className verwenden.
 */
export const SURFACE_CLASS: Record<SurfaceVariant, string> = {
  // Info-Card / Saldo-Card
  card:
    'rounded-2xl bg-white/80 backdrop-blur-xl border border-white/90 ' +
    'shadow-[0_8px_32px_-6px_oklch(0.510_0.230_22_/_0.14),0_2px_8px_-2px_oklch(0_0_0_/_0.07)] ' +
    'dark:bg-neutral-900/55 dark:border-neutral-700/60',

  // Mobile Bottom-Bar / App-Bar
  bar:
    'rounded-2xl bg-white/80 backdrop-blur-xl border border-[rgba(229,23,63,0.1)] ' +
    'dark:bg-neutral-900/70 dark:border-neutral-800/80',

  // Popover / Dropdown-Menu
  popover:
    'rounded-2xl bg-card/95 backdrop-blur-xl border border-border shadow-2xl',

  // Toast
  toast:
    'rounded-2xl bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg',
};
