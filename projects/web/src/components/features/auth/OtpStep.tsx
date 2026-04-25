import { useState, type FormEvent } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { TextField } from '@/components/ui/text-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { FormError } from '@/components/ui/form-error';
import { OtpProgressBar } from './OtpProgressBar';

interface OtpStepProps {
  onSubmit: (code: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  /** Nutzerinteraktion: zurück zum Telefonnummer-Schritt. */
  onBack?: () => void;
}

export function OtpStep({ onSubmit, loading, error, onBack }: OtpStepProps) {
  const [code, setCode] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    void onSubmit(code);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <div>
        <TextField
          label="Bestätigungscode"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="000000"
          iconStart={<KeyRound className="h-4 w-4" />}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          disabled={loading}
          autoFocus
          inputClassName="text-center text-2xl tracking-[0.45em] font-mono placeholder:tracking-[0.45em] placeholder:text-muted-foreground/25"
        />
        <OtpProgressBar filled={code.length} />
      </div>

      {error && <FormError variant="banner">{error}</FormError>}

      <div className="space-y-2">
        <SubmitButton type="submit" disabled={code.length < 6} loading={loading}>
          Verifizieren
        </SubmitButton>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full py-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Nummer korrigieren
          </button>
        )}
      </div>
    </form>
  );
}
