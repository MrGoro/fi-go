import { test, expect } from '@playwright/test';
import { resetEmulatorState } from './helpers/emulator';
import { signIn } from './helpers/auth';

// A fixed point well in the past: the app's clock is frozen here *after* login,
// so we get a deterministic 8h workday (08:00 → 16:00) in which the legal pause
// applies. Being in the past, the (real-time) auth token never looks expired.
const WORKDAY_NOW = new Date('2020-06-15T16:00:00');

test.beforeEach(async ({ request }) => {
  await resetEmulatorState(request);
});

test.describe('Arbeitszeit-Erfassung', () => {
  test('Anmelden, 8-Stunden-Tag mit Pause erfassen (inkl. gesetzlichem Abzug) und ausstempeln', async ({
    page,
    request,
  }) => {
    await test.step('Mit Telefonnummer und SMS-Code anmelden', async () => {
      await signIn(page, request);
    });

    // Freeze the in-app clock at 16:00 so the worked time is a stable 8 hours.
    await page.clock.setFixedTime(WORKDAY_NOW);

    await test.step('Mit Startzeit 08:00 einstempeln', async () => {
      await page.locator('input[type="time"]').fill('08:00');
      await page.getByRole('button', { name: /Startzeit eintragen/i }).click();
      await expect(page.getByText('Start', { exact: true })).toBeVisible();
      await expect(page.getByText('08:00')).toBeVisible();
    });

    await test.step('Gesetzliche Pause wird ohne manuelle Eingabe abgezogen', async () => {
      // 8h gross with no manual break → 30 min legal pause, fully legal.
      await expect(page.getByText('30 Min', { exact: true })).toBeVisible();
      await expect(page.getByText('inkl. 30 min gesetzl.')).toBeVisible();
    });

    await test.step('Manuelle 20-Minuten-Pause erfassen', async () => {
      // The Pausen/Feierabend actions live in the AppBar on desktop and in the
      // bottom bar on mobile — target whichever is currently visible.
      await page.getByRole('button', { name: 'Pausen' }).filter({ visible: true }).click();
      await page.getByRole('button', { name: 'Pause manuell erfassen' }).click();

      // Scope to the manual add-form — the drawer also contains StartBreakForm's
      // own time input, so an unscoped input[type=time] would match the wrong field.
      const addForm = page.locator('section', { hasText: 'Neue Pause erfassen' });
      await addForm.locator('input[type="time"]').nth(0).fill('12:00');
      await addForm.locator('input[type="time"]').nth(1).fill('12:20');
      await page.getByRole('button', { name: /Pause hinzufügen/i }).click();

      // Captured with the correct start, end, computed duration and list total.
      const breakRow = page.getByRole('listitem').filter({ hasText: '12:00' });
      await expect(breakRow).toContainText('12:00');
      await expect(breakRow).toContainText('12:20');
      await expect(breakRow).toContainText('20 Min');
      await expect(page.getByText('20 Min. gesamt')).toBeVisible();
    });

    await test.step('Gesamtpause bleibt 30 Min: 20 manuell + 10 gesetzlich', async () => {
      await page.keyboard.press('Escape'); // close the drawer
      await expect(page.getByText('30 Min', { exact: true })).toBeVisible();
      await expect(page.getByText('inkl. 10 min gesetzl.')).toBeVisible();
    });

    await test.step('Pause wieder entfernen – nur der gesetzliche Abzug bleibt', async () => {
      await page.getByRole('button', { name: 'Pausen' }).filter({ visible: true }).click();
      await page.getByRole('listitem').filter({ hasText: '12:00' }).getByRole('button').click();
      await expect(page.getByText('Noch keine Pausen erfasst.')).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(page.getByText('30 Min', { exact: true })).toBeVisible();
      await expect(page.getByText('inkl. 30 min gesetzl.')).toBeVisible();
    });

    await test.step('Ausstempeln (Feierabend) führt zurück zur Einstempel-Ansicht', async () => {
      await page.getByRole('button', { name: /Feierabend/i }).filter({ visible: true }).click();
      await expect(page.getByRole('button', { name: /Jetzt einstempeln/i })).toBeVisible();
    });
  });

  test('Über das Profilmenü abmelden und zur Anmeldung zurückkehren', async ({ page, request }) => {
    await test.step('Anmelden', async () => {
      await signIn(page, request);
    });

    await test.step('Profilmenü öffnen und abmelden', async () => {
      // The profile dropdown trigger is the only menu-haspopup button; the breaks
      // drawer trigger uses haspopup="dialog".
      await page.locator('button[aria-haspopup="menu"]').click();
      await page.getByRole('menuitem', { name: 'Abmelden' }).click();
    });

    await test.step('Login-Ansicht wird wieder angezeigt', async () => {
      await expect(page.getByPlaceholder('+49 151 ...')).toBeVisible();
    });
  });
});
