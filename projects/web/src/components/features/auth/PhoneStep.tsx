import { useState, type FormEvent } from 'react';
import { ChevronRight, Smartphone } from 'lucide-react';
import { TextField } from '@/components/ui/text-field';
import { SubmitButton } from '@/components/ui/submit-button';
import { FormError } from '@/components/ui/form-error';

interface PhoneStepProps {
  onSubmit: (phoneNumber: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export function PhoneStep({ onSubmit, loading, error }: PhoneStepProps) {
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    void onSubmit(phoneNumber);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 animate-in fade-in slide-in-from-bottom-3 duration-300"
    >
      <TextField
        label="Telefonnummer"
        type="tel"
        placeholder="+49 151 ..."
        iconStart={<Smartphone className="h-4 w-4" />}
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        disabled={loading}
        autoFocus
      />

      {error && <FormError variant="banner">{error}</FormError>}

      <SubmitButton type="submit" disabled={!phoneNumber} loading={loading}>
        <span>SMS-Code senden</span>
        <ChevronRight className="h-4 w-4" />
      </SubmitButton>

      <p className="text-[10px] text-center text-muted-foreground/60 leading-relaxed">
        Mit der Anmeldung akzeptierst du unsere Nutzungsbedingungen.
        SMS-Gebühren können anfallen.
      </p>
    </form>
  );
}
