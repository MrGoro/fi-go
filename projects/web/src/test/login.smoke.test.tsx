import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';

vi.mock('@/config/firebase', async () => (await import('./fakeFirebase')).configModule);
vi.mock('firebase/auth', async () => (await import('./fakeFirebase')).authModule);
vi.mock('firebase/database', async () => (await import('./fakeFirebase')).databaseModule);
vi.mock('firebase/messaging', async () => (await import('./fakeFirebase')).messagingModule);

describe('Login flow smoke', () => {
  it('walks phone → OTP → authenticated input screen', async () => {
    const user = userEvent.setup();
    renderApp();

    // Step 1: phone number.
    const phone = await screen.findByPlaceholderText('+49 151 ...');
    await user.type(phone, '015112345678');
    await user.click(screen.getByRole('button', { name: /SMS-Code senden/i }));

    // Step 2: OTP code.
    const otp = await screen.findByPlaceholderText('000000');
    await user.type(otp, '123456');
    await user.click(screen.getByRole('button', { name: /Verifizieren/i }));

    // Step 3: signed in with an empty session → clock-in screen.
    expect(await screen.findByRole('button', { name: /Jetzt einstempeln/i })).toBeInTheDocument();
  });
});
