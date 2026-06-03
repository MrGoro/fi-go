import type { APIRequestContext } from '@playwright/test';

const PROJECT = 'demo-fi-go';
const AUTH_BASE = 'http://127.0.0.1:9099';
const DB_BASE = 'http://127.0.0.1:9000';
const DB_NS = `${PROJECT}-default-rtdb`;

// The Auth emulator accepts any bearer token as the privileged "owner".
const OWNER = { Authorization: 'Bearer owner' };

interface VerificationCode {
  code: string;
  phoneNumber: string;
}

/** Returns the most recently issued SMS code from the Auth emulator. */
export async function getLatestOtp(request: APIRequestContext): Promise<string> {
  const res = await request.get(
    `${AUTH_BASE}/emulator/v1/projects/${PROJECT}/verificationCodes`,
  );
  const body = (await res.json()) as { verificationCodes?: VerificationCode[] };
  const codes = body.verificationCodes ?? [];
  if (codes.length === 0) {
    throw new Error('No verification codes found in the Auth emulator.');
  }
  return codes[codes.length - 1].code;
}

/** Clears all accounts and database state so each test starts from scratch. */
export async function resetEmulatorState(request: APIRequestContext): Promise<void> {
  await request.delete(`${AUTH_BASE}/emulator/v1/projects/${PROJECT}/accounts`, {
    headers: OWNER,
  });
  await request.delete(`${DB_BASE}/.json?ns=${DB_NS}`, { headers: OWNER });
}
