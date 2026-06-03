import { expect, type Page, type APIRequestContext } from '@playwright/test';
import { getLatestOtp } from './emulator';

/**
 * Drives the phone → OTP login against the Auth emulator and leaves the app on
 * the clock-in screen (signed in, empty session).
 */
export async function signIn(page: Page, request: APIRequestContext): Promise<void> {
  await page.goto('/');

  await page.getByPlaceholder('+49 151 ...').fill('+4915112345678');
  await page.getByRole('button', { name: /SMS-Code senden/i }).click();

  const otp = page.getByPlaceholder('000000');
  await expect(otp).toBeVisible();
  await otp.fill(await getLatestOtp(request));
  await page.getByRole('button', { name: /Verifizieren/i }).click();

  await expect(page.getByRole('button', { name: /Jetzt einstempeln/i })).toBeVisible();
}
