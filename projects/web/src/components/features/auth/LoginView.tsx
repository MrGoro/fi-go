import React, { useState } from 'react';
import { ChevronRight, Smartphone, KeyRound, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { Logo } from '../../ui/Logo';
import { cn } from '@/lib/utils';

export default function LoginView() {
  const { requestOtp, verifyOtp, hasSentOtp } = useAuth();
  const [phoneNumber, setPhoneNumber]       = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const mapAuthErrorToMessage = (code: string): string => {
    switch (code) {
      case 'auth/invalid-phone-number':
        return 'Die Telefonnummer ist ungültig.';
      case 'auth/too-many-requests':
        return 'Zu viele Versuche. Bitte probiere es später erneut.';
      case 'auth/code-expired':
        return 'Der SMS-Code ist abgelaufen. Bitte fordere einen neuen an.';
      case 'auth/invalid-verification-code':
        return 'Der eingegebene Code ist falsch.';
      case 'auth/captcha-check-failed':
        return 'Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut.';
      case 'auth/network-request-failed':
        return 'Netzwerkfehler. Bitte prüfe deine Internetverbindung.';
      case 'auth/user-disabled':
        return 'Dieser Account wurde deaktiviert.';
      default:
        return 'Ein unerwarteter Fehler ist aufgetreten.';
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    setLoading(true);
    setError(null);
    try {
      const cleaned = phoneNumber.replace(/[^\d+]/g, '');
      
      // Basic validation
      if (cleaned.length < 6) {
        setError('Bitte gib eine gültige Telefonnummer ein.');
        setLoading(false);
        return;
      }

      const formatted = cleaned.startsWith('+')
        ? cleaned
        : `+49${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`;
      await requestOtp(formatted, 'recaptcha-container');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(mapAuthErrorToMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode) return;
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(verificationCode);
    } catch (err: any) {
      setError(mapAuthErrorToMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">

      {/* ── Brand Panel ───────────────────────────────────────────────── */}
      <div
        className="relative flex flex-col items-center justify-center px-8 py-14 overflow-hidden min-h-[260px] lg:min-h-svh lg:w-[44%] lg:flex-none"
        style={{ background: 'linear-gradient(145deg, #E5173F 0%, #7e0d22 100%)' }}
      >
        <TimeDecoration />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center gap-5 text-center">
          <Logo height={38} color="white" />

          <p className="text-white/65 text-[15px] leading-snug max-w-[200px]">
            Arbeitszeit einfach<br />erfassen.
          </p>

          {/* Decorative step dots */}
          <div className="flex gap-2 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
            <span className="w-5 h-1.5 rounded-full bg-white/70" />
            <span className="w-1.5 h-1.5 rounded-full bg-white/30" />
          </div>
        </div>
      </div>

      {/* ── Form Panel ────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px]">

          {/* Step heading */}
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h1 className="text-[22px] font-bold tracking-tight text-foreground">
              {hasSentOtp ? 'Code eingeben' : 'Willkommen'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {hasSentOtp
                ? `Code wurde an ${phoneNumber} gesendet.`
                : 'Melde dich mit deiner Telefonnummer an.'}
            </p>
          </div>

          {!hasSentOtp ? (
            /* ── Schritt 1: Telefonnummer ────────────────────────────── */
            <form
              key="phone"
              onSubmit={handleSendOtp}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Telefonnummer
                </label>
                <div className="relative">
                  <Smartphone className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    type="tel"
                    placeholder="+49 151 ..."
                    className={cn(
                      'w-full h-13 rounded-2xl border border-[rgba(229,23,63,0.2)] bg-white/90',
                      'pl-10 pr-4 text-base outline-none',
                      'shadow-[0_2px_10px_rgba(0,0,0,0.07)]',
                      'placeholder:text-muted-foreground/40',
                      'transition-all duration-150',
                      'focus:border-[rgba(229,23,63,0.4)] focus:ring-3 focus:ring-primary/10 focus:bg-white',
                      'dark:bg-neutral-900 dark:border-neutral-800 dark:focus:bg-neutral-950'
                    )}
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    disabled={loading}
                    autoFocus
                  />
                </div>
              </div>

              {error && <ErrorBanner message={error} />}

              <PrimaryButton
                type="submit"
                disabled={loading || !phoneNumber}
              >
                {loading
                  ? <Loader2 className="h-5 w-5 animate-spin" />
                  : <><span>SMS-Code senden</span><ChevronRight className="h-4 w-4" /></>
                }
              </PrimaryButton>

              <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed">
                Mit der Anmeldung akzeptierst du unsere Nutzungsbedingungen.
                SMS-Gebühren können anfallen.
              </p>
            </form>
          ) : (
            /* ── Schritt 2: OTP ──────────────────────────────────────── */
            <form
              key="otp"
              onSubmit={handleVerifyOtp}
              className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
            >
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                  Bestätigungscode
                </label>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    className={cn(
                      'w-full h-13 rounded-2xl border border-[rgba(229,23,63,0.2)] bg-white/90',
                      'pl-10 pr-4 text-center text-2xl tracking-[0.45em] font-mono outline-none',
                      'shadow-[0_2px_10px_rgba(0,0,0,0.07)]',
                      'placeholder:text-muted-foreground/25 placeholder:tracking-[0.45em]',
                      'transition-all duration-150',
                      'focus:border-[rgba(229,23,63,0.4)] focus:ring-3 focus:ring-primary/10 focus:bg-white',
                      'dark:bg-neutral-900 dark:border-neutral-800 dark:focus:bg-neutral-950'
                    )}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                    disabled={loading}
                    autoFocus
                  />
                </div>

                {/* 6-Digit progress bar */}
                <div className="flex gap-1 mt-2 px-0.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex-1 h-0.5 rounded-full transition-all duration-200',
                        i < verificationCode.length
                          ? 'bg-primary'
                          : 'bg-neutral-200 dark:bg-neutral-800'
                      )}
                    />
                  ))}
                </div>
              </div>

              {error && <ErrorBanner message={error} />}

              <div className="space-y-2">
                <PrimaryButton
                  type="submit"
                  disabled={loading || verificationCode.length < 6}
                >
                  {loading
                    ? <Loader2 className="h-5 w-5 animate-spin" />
                    : 'Verifizieren'
                  }
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="h-3 w-3" />
                  Nummer korrigieren
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* reCAPTCHA-Container (unsichtbar) */}
      <div id="recaptcha-container" />
    </div>
  );
}

/* ── Dekorative SVG-Grafik ────────────────────────────────────────────────── */

/**
 * Abstrakte Timer-Bögen, bewusst asymmetrisch in den Randbereich verschoben.
 *
 * Winkelkonvention: 0° = 12 Uhr, CW positiv.
 * Formel: x = cx + r·sin(θ),  y = cy − r·cos(θ)
 *
 * Zwei Zentren – beide weit genug vom Textbereich [80–320 × 190–300] entfernt:
 *
 *  Gruppe B – cx=400, cy=500 (Ecke unten-rechts):
 *    Mindestabstand zum Text = √(80²+200²) ≈ 215 → r ≤ 190 bleibt außen.
 *
 *  Gruppe C – cx=400, cy=250 (rechte Mitte):
 *    Mindestabstand zum Text = 80 (bis x=320) → r ≤ 65 bleibt außen.
 *    Sorgt dafür, dass auf Mobile (landscape-crop) immer etwas sichtbar ist.
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
      {/* ── Gruppe B: unten-rechts, cx=400 cy=500 ──────────────────── */}

      {/* B1 — r=190, −90° → −5°  (85° Bogen, größter Radius)
          Start (−90°): x=210 y=500   End (−5°): x=383 y=311  */}
      <path d="M 210,500 A 190,190 0 0 1 383,311"
            strokeWidth="1.5" opacity="0.07" />

      {/* B2 — r=130, −90° → −8°  (82° Bogen)
          Start (−90°): x=270 y=500   End (−8°): x=382 y=371  */}
      <path d="M 270,500 A 130,130 0 0 1 382,371"
            strokeWidth="2" opacity="0.11" />

      {/* B3 — r=75,  −85° → −15° (70° Bogen)
          Start (−85°): x=325 y=487   End (−15°): x=381 y=428  */}
      <path d="M 325,487 A 75,75 0 0 1 381,428"
            strokeWidth="2.5" opacity="0.19" />

      {/* B4 — r=42,  −70° → −20° (50° Bogen, kleinstes Segment)
          Start (−70°): x=361 y=486   End (−20°): x=386 y=461  */}
      <path d="M 361,486 A 42,42 0 0 1 386,461"
            strokeWidth="3" opacity="0.27" />

      {/* Endpunkt-Dot am sichtbarsten Bogen */}
      <circle cx="383" cy="311" r="2.5" fill="white" stroke="none" opacity="0.22" />

      {/* ── Gruppe C: rechte Mitte, cx=400 cy=250 ──────────────────── */}
      {/* Auf Mobile (landscape-crop, y≈117–383) immer im Bild.          */}
      {/* r ≤ 65: x-Minimum = 400−65=335 > 320 → kein Overlap mit Text. */}

      {/* C1 — r=65, −150° → −100° (50° Bogen)
          Start (−150°): x=368 y=306   End (−100°): x=336 y=261  */}
      <path d="M 368,306 A 65,65 0 0 1 336,261"
            strokeWidth="2" opacity="0.13" />

      {/* C2 — r=38, −145° → −108° (37° Bogen, innerster Akzent)
          Start (−145°): x=378 y=281   End (−108°): x=364 y=262  */}
      <path d="M 378,281 A 38,38 0 0 1 364,262"
            strokeWidth="2.5" opacity="0.20" />
    </svg>
  );
}

/* ── Kleine Hilfs-Komponenten ─────────────────────────────────────────────── */

function PrimaryButton({
  children,
  disabled,
  type = 'button',
}: {
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit';
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(
        'w-full h-13 rounded-2xl font-semibold text-[15px]',
        'bg-primary text-white',
        'flex items-center justify-center gap-1.5',
        'transition-all duration-150',
        'hover:brightness-110',
        'hover:shadow-[0_6px_20px_oklch(0.510_0.230_22_/_0.35)]',
        'active:scale-[0.98] active:brightness-95',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 disabled:shadow-none',
        'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-primary/30'
      )}
    >
      {children}
    </button>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2 bg-destructive/10 text-destructive text-xs font-medium rounded-xl px-3 py-2.5 animate-in fade-in slide-in-from-top-1 duration-200">
      {message}
    </div>
  );
}
