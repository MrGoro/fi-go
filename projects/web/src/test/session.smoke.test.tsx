import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderApp } from './renderApp';
import { setFakeUser } from './fakeFirebase';

vi.mock('@/config/firebase', async () => (await import('./fakeFirebase')).configModule);
vi.mock('firebase/auth', async () => (await import('./fakeFirebase')).authModule);
vi.mock('firebase/database', async () => (await import('./fakeFirebase')).databaseModule);
vi.mock('firebase/messaging', async () => (await import('./fakeFirebase')).messagingModule);

describe('Session flow smoke', () => {
  it('clocks in to the display screen and clocks out again', async () => {
    const user = userEvent.setup();
    setFakeUser('test-uid'); // skip the OTP flow — start already authenticated

    renderApp();

    // Empty session → clock-in screen.
    await user.click(await screen.findByRole('button', { name: /Jetzt einstempeln/i }));

    // DisplayScreen shows the live stats card.
    expect(await screen.findByText('Start')).toBeInTheDocument();
    expect(screen.getByText('Pause')).toBeInTheDocument();
    // Saldo is rendered as a signed, zero-padded ±HH:MM (unlike the unsigned ring/stat labels).
    expect(screen.getByText(/^[+-]\d{2}:\d{2}$/)).toBeInTheDocument();

    // "Feierabend" clocks out → back to the clock-in screen.
    const [feierabend] = screen.getAllByRole('button', { name: /Feierabend/i });
    await user.click(feierabend);

    expect(await screen.findByRole('button', { name: /Jetzt einstempeln/i })).toBeInTheDocument();
  });
});
