import { test, expect } from '@playwright/test';
import { addMinutes, format } from 'date-fns';
import { getLatestOtp, resetEmulatorState } from './helpers/emulator';

test.beforeEach(async ({ request }) => {
  await resetEmulatorState(request);
});

test('login → clock in → add/remove break → clock out', async ({ page, request }) => {
  await page.goto('/');

  // ── Login: phone number → OTP ──────────────────────────────────────────────
  await page.getByPlaceholder('+49 151 ...').fill('+4915112345678');
  await page.getByRole('button', { name: /SMS-Code senden/i }).click();

  const otp = page.getByPlaceholder('000000');
  await expect(otp).toBeVisible();
  await otp.fill(await getLatestOtp(request));
  await page.getByRole('button', { name: /Verifizieren/i }).click();

  // ── Clock in ────────────────────────────────────────────────────────────────
  await page.getByRole('button', { name: /Jetzt einstempeln/i }).click();

  // ── Display screen shows the live stats; pause starts at 0 ────────────────────
  // Exact match: Playwright's getByText is substring-based, and "Pause" would
  // otherwise also match the "Pausen" drawer trigger.
  await expect(page.getByText('Start', { exact: true })).toBeVisible();
  await expect(page.getByText('Pause', { exact: true })).toBeVisible();
  await expect(page.getByText('0 Min', { exact: true })).toBeVisible();

  // ── Add a 30-minute break via the drawer ─────────────────────────────────────
  // Window relative to "now" so it always passes the form's validation
  // (start >= clock-in, end > start, no overlap). The break duration counts
  // towards the applied pause regardless of lying slightly in the future.
  const now = new Date();
  const breakStart = format(addMinutes(now, 5), 'HH:mm');
  const breakEnd = format(addMinutes(now, 35), 'HH:mm');

  await page.getByRole('button', { name: 'Pausen' }).first().click();
  await page.getByRole('button', { name: 'Pause manuell erfassen' }).click();

  // Scope to the manual add-form — the drawer also contains StartBreakForm's
  // own time input, so an unscoped input[type=time] would match the wrong field.
  const addForm = page.locator('section', { hasText: 'Neue Pause erfassen' });
  await addForm.locator('input[type="time"]').nth(0).fill(breakStart);
  await addForm.locator('input[type="time"]').nth(1).fill(breakEnd);
  await page.getByRole('button', { name: /Pause hinzufügen/i }).click();

  // The break is captured with the correct start, end and computed duration,
  // and rolled up into the list total.
  const breakRow = page.getByRole('listitem').filter({ hasText: breakStart });
  await expect(breakRow).toContainText(breakStart);
  await expect(breakRow).toContainText(breakEnd);
  await expect(breakRow).toContainText('30 Min');
  await expect(page.getByText('30 Min. gesamt')).toBeVisible();

  // …and it flows through to the work-time calculation on the main screen.
  await page.keyboard.press('Escape'); // close the drawer
  await expect(page.getByText('30 Min', { exact: true })).toBeVisible();

  // ── Remove the break again ───────────────────────────────────────────────────
  await page.getByRole('button', { name: 'Pausen' }).first().click();
  await page.getByRole('listitem').filter({ hasText: breakStart }).getByRole('button').click();
  await expect(page.getByText('Noch keine Pausen erfasst.')).toBeVisible();

  // Applied pause is back to zero on the main screen.
  await page.keyboard.press('Escape');
  await expect(page.getByText('0 Min', { exact: true })).toBeVisible();

  // ── Clock out → back to the clock-in screen ──────────────────────────────────
  await page.getByRole('button', { name: /Feierabend/i }).first().click();
  await expect(page.getByRole('button', { name: /Jetzt einstempeln/i })).toBeVisible();
});
