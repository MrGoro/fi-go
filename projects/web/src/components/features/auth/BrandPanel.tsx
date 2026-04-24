import { Logo } from '../../ui/logo';

/**
 * Abstrakte Timer-Bögen, bewusst asymmetrisch in den Randbereich verschoben.
 *
 * Winkelkonvention: 0° = 12 Uhr, CW positiv. Formel: x = cx + r·sin(θ), y = cy − r·cos(θ).
 *
 * Zwei Zentren — beide weit genug vom Textbereich [80–320 × 190–300] entfernt:
 *  Gruppe B — cx=400, cy=500 (Ecke unten-rechts): r ≤ 190 bleibt außen.
 *  Gruppe C — cx=400, cy=250 (rechte Mitte):     r ≤ 65 bleibt außen.
 * Sorgt dafür, dass auf Mobile (landscape-crop) immer etwas sichtbar ist.
 */
function TimeDecoration() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 400 500"
      className="absolute inset-0 w-full h-full"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      fill="none"
      stroke="white"
      strokeLinecap="round"
    >
      {/* Gruppe B: unten-rechts, cx=400 cy=500 */}
      <path d="M 210,500 A 190,190 0 0 1 383,311" strokeWidth="1.5" opacity="0.07" />
      <path d="M 270,500 A 130,130 0 0 1 382,371" strokeWidth="2"   opacity="0.11" />
      <path d="M 325,487 A 75,75   0 0 1 381,428" strokeWidth="2.5" opacity="0.19" />
      <path d="M 361,486 A 42,42   0 0 1 386,461" strokeWidth="3"   opacity="0.27" />
      <circle cx="383" cy="311" r="2.5" fill="white" stroke="none" opacity="0.22" />

      {/* Gruppe C: rechte Mitte, cx=400 cy=250 */}
      <path d="M 368,306 A 65,65 0 0 1 336,261" strokeWidth="2"   opacity="0.13" />
      <path d="M 378,281 A 38,38 0 0 1 364,262" strokeWidth="2.5" opacity="0.20" />
    </svg>
  );
}

export function BrandPanel() {
  return (
    <div
      className="relative flex flex-col items-center justify-center px-8 py-14 overflow-hidden min-h-[260px] lg:min-h-svh lg:w-[44%] lg:flex-none"
      style={{ background: 'linear-gradient(145deg, #E5173F 0%, #7e0d22 100%)' }}
    >
      <TimeDecoration />

      <div className="relative z-10 flex flex-col items-center gap-5 text-center">
        <Logo height={38} color="white" />

        <p className="text-white/65 text-[15px] leading-snug max-w-[200px]">
          Arbeitszeit einfach<br />erfassen.
        </p>

        {/* Decorative step dots */}
        <div className="flex gap-2 mt-1">
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          <span className="w-5   h-1.5 rounded-full bg-white/70" />
          <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}
