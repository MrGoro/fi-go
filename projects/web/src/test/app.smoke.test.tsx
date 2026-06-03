import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderApp } from './renderApp';

vi.mock('@/config/firebase', async () => (await import('./fakeFirebase')).configModule);
vi.mock('firebase/auth', async () => (await import('./fakeFirebase')).authModule);
vi.mock('firebase/database', async () => (await import('./fakeFirebase')).databaseModule);
vi.mock('firebase/messaging', async () => (await import('./fakeFirebase')).messagingModule);

describe('App smoke', () => {
  it('boots and lands on the login screen for a signed-out user', async () => {
    renderApp();

    // Auth resolves to "no user" → the phone-number login step is shown.
    expect(await screen.findByPlaceholderText('+49 151 ...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /SMS-Code senden/i })).toBeInTheDocument();
  });
});
