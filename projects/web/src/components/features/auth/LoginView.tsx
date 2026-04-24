import { useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { extractAuthErrorMessage, normalizeGermanPhone } from '@/lib/auth-errors';
import { PageHeading } from '@/components/ui/page-heading';
import { BrandPanel } from './BrandPanel';
import { PhoneStep } from './PhoneStep';
import { OtpStep } from './OtpStep';

export function LoginView() {
  const { requestOtp, verifyOtp, hasSentOtp } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  const handleRequestOtp = async (input: string) => {
    setLoading(true);
    setError(null);
    try {
      const formatted = normalizeGermanPhone(input);
      if (!formatted) {
        setError('Bitte gib eine gültige Telefonnummer ein.');
        return;
      }
      await requestOtp(formatted, 'recaptcha-container');
      setPhoneNumber(formatted);
    } catch (err) {
      console.error('Login error:', err);
      setError(extractAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (code: string) => {
    setLoading(true);
    setError(null);
    try {
      await verifyOtp(code);
    } catch (err) {
      setError(extractAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row">
      <BrandPanel />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-14">
        <div className="w-full max-w-[340px]">
          <PageHeading
            title={hasSentOtp ? 'Code eingeben' : 'Willkommen'}
            subtitle={
              hasSentOtp
                ? `Code wurde an ${phoneNumber} gesendet.`
                : 'Melde dich mit deiner Telefonnummer an.'
            }
          />

          {!hasSentOtp ? (
            <PhoneStep onSubmit={handleRequestOtp} loading={loading} error={error} />
          ) : (
            <OtpStep
              onSubmit={handleVerifyOtp}
              loading={loading}
              error={error}
              onBack={() => window.location.reload()}
            />
          )}
        </div>
      </div>

      {/* reCAPTCHA-Container (unsichtbar) */}
      <div id="recaptcha-container" />
    </div>
  );
}
