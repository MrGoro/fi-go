interface LogoProps {
  /** Renderhöhe in Pixel. Breite skaliert proportional. */
  height?: number
  /** SVG-Farbwert. Standard: Primärfarbe #E5173F. */
  color?: string
  className?: string
}

/**
 * fi-go Wordmark – pfad-basiertes SVG (kein Text, daher browser-unabhängig).
 *
 * Monoline-Schrift auf 28-Einheiten-Grid, stroke-width 2.4, rounded caps.
 * Buchstaben: f i – g o   (alle Kleinbuchstaben, geometric-sans Stil)
 */
export function Logo({ height = 28, color = '#E5173F', className, ...props }: LogoProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 67 28"
      height={height}
      aria-label="fi-go"
      role="img"
      fill="none"
      stroke={color}
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      {...props}
    >
      {/* f: Schaft + Bogen oben rechts + Querstrich */}
      <path d="M 9,21 L 9,7 Q 9,3 13,3 L 14,3" />
      <path d="M 4,13 L 14,13" />

      {/* i: Schaft + Punkt */}
      <path d="M 18,12 L 18,21" />
      <circle cx="18" cy="8" r="1.5" fill={color} stroke="none" />

      {/* Bindestrich */}
      <path d="M 22,15 L 31,15" />

      {/* g: geschlossenes Oval + Abstrich mit Endstrich */}
      <path d="M 49,16 Q 49,11 42,11 Q 35,11 35,16 Q 35,21 42,21 Q 49,21 49,16 L 49,24 Q 49,26 42,26 Q 37,26 35,23" />

      {/* o: geschlossenes Oval */}
      <path d="M 65,16 Q 65,11 59,11 Q 53,11 53,16 Q 53,21 59,21 Q 65,21 65,16 Z" />
    </svg>
  )
}
