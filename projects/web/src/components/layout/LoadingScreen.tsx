import { ChevronDown } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { Surface } from '../ui/surface';
import { AppBarShell } from '../ui/app-bar-shell';
import { RING, RING_COLORS, RING_TRACK_PATH } from '@/lib/ring-geometry';

export default function LoadingScreen() {
  return (
    <div className="min-h-svh flex flex-col">

      {/* ── AppBar skeleton ──────────────────────────────────────────── */}
      <AppBarShell>
        <Logo height={22} />
        <div className="flex-1" />
        <div className="hidden sm:flex items-center gap-3 mr-2">
          <div className="w-20 h-8 rounded-full bg-neutral-200/80 animate-pulse" />
          <div className="w-24 h-8 rounded-full bg-neutral-200/80 animate-pulse" />
        </div>
        {/* Profile menu placeholder — Layout identisch zu ProfileMenu */}
        <div className="flex items-center gap-1.5 p-1 px-1.5">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60" />
        </div>
      </AppBarShell>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <div className="flex-1 flex max-w-5xl mx-auto w-full sm:px-8 py-6 pb-32 sm:pb-6 overflow-x-hidden">
        <main className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px]">
          <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-5 py-6">

            {/* Ring skeleton */}
            <div className="relative w-full max-w-full sm:max-w-[440px] aspect-square">
              <svg viewBox="0 0 340 340" className="w-full h-full" aria-hidden="true">
                <path
                  d={RING_TRACK_PATH}
                  stroke={RING_COLORS.track}
                  strokeWidth={RING.STROKE}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none">
                <div className="w-28 h-12 rounded-2xl bg-neutral-200/70 animate-pulse" />
                <div className="w-36 h-3 rounded-full bg-neutral-200/50 animate-pulse" />
              </div>
            </div>

            {/* Info-Card skeleton */}
            <Surface variant="card" className="w-full max-w-sm">
              <div className="grid grid-cols-2 divide-x divide-white/80">
                {[0, 1].map(i => (
                  <div key={i} className="flex flex-col items-center px-4 py-3.5 gap-2">
                    <div className="w-8 h-2 rounded-full bg-neutral-200/70 animate-pulse" />
                    <div className="w-16 h-5 rounded-lg bg-neutral-200/70 animate-pulse" />
                  </div>
                ))}
              </div>
            </Surface>

          </div>
        </main>
      </div>

      {/* ── Mobile bottom bar skeleton ───────────────────────────────── */}
      <div className="fixed bottom-0 inset-x-0 p-4 z-40 sm:hidden">
        <div className="max-w-md mx-auto">
          <Surface variant="bar" className="flex justify-around items-center w-full py-3 px-4">
            {(['w-10', 'w-16'] as const).map((w, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-2.5 px-5">
                <div className="w-6 h-6 rounded-md bg-neutral-200/70 animate-pulse" />
                <div className={`${w} h-2 rounded-full bg-neutral-200/50 animate-pulse`} />
              </div>
            ))}
          </Surface>
        </div>
      </div>

    </div>
  );
}
