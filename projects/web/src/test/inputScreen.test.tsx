import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { InputScreen } from '@/components/features/timer/InputScreen';

// Freeze the clock at 12:00 so "future"/"past" times are deterministic.
beforeEach(() => {
  vi.useFakeTimers({ now: new Date(2026, 5, 3, 12, 0, 0) });
});
afterEach(() => {
  vi.useRealTimers();
});

function renderScreen() {
  const onStart = vi.fn();
  const { container } = render(<InputScreen onStart={onStart} loading={false} />);
  const timeInput = container.querySelector('input[type="time"]') as HTMLInputElement;
  return { onStart, timeInput };
}

describe('InputScreen', () => {
  it('blocks a start time in the future', () => {
    const { timeInput } = renderScreen();
    fireEvent.change(timeInput, { target: { value: '23:00' } });

    expect(screen.getByText('Die Startzeit darf nicht in der Zukunft liegen.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Startzeit eintragen/i })).toBeDisabled();
  });

  it('submits a valid custom start time', async () => {
    const { onStart, timeInput } = renderScreen();
    fireEvent.change(timeInput, { target: { value: '06:00' } });

    const submit = screen.getByRole('button', { name: /Startzeit eintragen/i });
    expect(submit).toBeEnabled();
    await act(async () => {
      fireEvent.click(submit);
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    const arg = onStart.mock.calls[0][0] as Date;
    expect([arg.getHours(), arg.getMinutes()]).toEqual([6, 0]);
  });

  it('clocks in with the current time via "Jetzt einstempeln"', async () => {
    const { onStart } = renderScreen();
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /Jetzt einstempeln/i }));
    });

    expect(onStart).toHaveBeenCalledTimes(1);
    const arg = onStart.mock.calls[0][0] as Date;
    expect(arg.getHours()).toBe(12); // frozen "now"
  });
});
