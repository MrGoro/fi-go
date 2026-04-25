const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-phone-number':    'Die Telefonnummer ist ungültig.',
  'auth/too-many-requests':       'Zu viele Versuche. Bitte probiere es später erneut.',
  'auth/code-expired':            'Der SMS-Code ist abgelaufen. Bitte fordere einen neuen an.',
  'auth/invalid-verification-code': 'Der eingegebene Code ist falsch.',
  'auth/captcha-check-failed':    'Sicherheitsprüfung fehlgeschlagen. Bitte versuche es erneut.',
  'auth/network-request-failed':  'Netzwerkfehler. Bitte prüfe deine Internetverbindung.',
  'auth/user-disabled':           'Dieser Account wurde deaktiviert.',
};

export function mapAuthErrorToMessage(code: string | undefined): string {
  if (code && code in AUTH_ERROR_MESSAGES) return AUTH_ERROR_MESSAGES[code];
  return 'Ein unerwarteter Fehler ist aufgetreten.';
}

/**
 * Extrahiert den Firebase-Auth-Fehlercode aus einem unknown-Error.
 * Firebase-SDK wirft Objekte der Form `{ code: 'auth/...', message: string }`.
 */
export function extractAuthErrorMessage(err: unknown): string {
  if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') {
    return mapAuthErrorToMessage(err.code);
  }
  return mapAuthErrorToMessage(undefined);
}

/**
 * Normalisiert eine deutsche Telefonnummer-Eingabe zu E.164-Format.
 * Entfernt alle Nicht-Ziffern außer +. Ergänzt +49 wenn Nummer mit 0 beginnt.
 * Gibt null zurück, wenn die Nummer unplausibel kurz ist.
 */
export function normalizeGermanPhone(input: string): string | null {
  const cleaned = input.replace(/[^\d+]/g, '');
  if (cleaned.length < 6) return null;
  if (cleaned.startsWith('+')) return cleaned;
  return `+49${cleaned.startsWith('0') ? cleaned.slice(1) : cleaned}`;
}
