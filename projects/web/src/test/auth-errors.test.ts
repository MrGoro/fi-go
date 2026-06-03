import { describe, it, expect } from 'vitest';
import {
  normalizeGermanPhone,
  mapAuthErrorToMessage,
  extractAuthErrorMessage,
} from '@/lib/auth-errors';

describe('normalizeGermanPhone', () => {
  it('converts a national 0-prefixed number to E.164', () => {
    expect(normalizeGermanPhone('0151 23456789')).toBe('+4915123456789');
  });

  it('keeps an already international +-number (stripping separators)', () => {
    expect(normalizeGermanPhone('+49 151 23456789')).toBe('+4915123456789');
  });

  it('prefixes +49 for a bare number without leading zero', () => {
    expect(normalizeGermanPhone('15123456789')).toBe('+4915123456789');
  });

  it('returns null for implausibly short input', () => {
    expect(normalizeGermanPhone('123')).toBeNull();
  });
});

describe('mapAuthErrorToMessage', () => {
  it('maps known Firebase auth codes to German messages', () => {
    expect(mapAuthErrorToMessage('auth/invalid-phone-number')).toBe('Die Telefonnummer ist ungültig.');
    expect(mapAuthErrorToMessage('auth/invalid-verification-code')).toBe('Der eingegebene Code ist falsch.');
  });

  it('falls back for unknown or missing codes', () => {
    expect(mapAuthErrorToMessage('auth/whatever')).toBe('Ein unerwarteter Fehler ist aufgetreten.');
    expect(mapAuthErrorToMessage(undefined)).toBe('Ein unerwarteter Fehler ist aufgetreten.');
  });
});

describe('extractAuthErrorMessage', () => {
  it('reads the code off a Firebase-style error object', () => {
    expect(extractAuthErrorMessage({ code: 'auth/code-expired' })).toBe(
      'Der SMS-Code ist abgelaufen. Bitte fordere einen neuen an.',
    );
  });

  it('falls back for non-error values', () => {
    expect(extractAuthErrorMessage('boom')).toBe('Ein unerwarteter Fehler ist aufgetreten.');
  });
});
