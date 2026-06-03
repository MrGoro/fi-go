import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BreaksAddForm } from '@/components/features/breaks/BreaksAddForm';
import type { FirebaseBreakRecord } from '@/hooks/useSessionData';

// Build a Date at HH:MM today (matches what parseToTodayDate does internally,
// so cross-date comparisons in the form stay consistent).
const at = (h: number, m: number) => {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
};

const START_TIME = at(8, 0);

function renderForm(breaks: FirebaseBreakRecord[] = []) {
  const onAdd = vi.fn().mockResolvedValue(undefined);
  const { container } = render(
    <BreaksAddForm startTime={START_TIME} breaks={breaks} onAdd={onAdd} />,
  );
  const inputs = container.querySelectorAll('input[type="time"]');
  const fill = (start: string, end: string) => {
    fireEvent.change(inputs[0], { target: { value: start } });
    fireEvent.change(inputs[1], { target: { value: end } });
  };
  const submit = () => screen.getByRole('button', { name: /Pause hinzufügen/i });
  return { onAdd, fill, submit };
}

describe('BreaksAddForm validation', () => {
  it('rejects an end time that is not after the start', () => {
    const { fill, submit } = renderForm();
    fill('10:00', '09:00');
    expect(screen.getByText('Die Endzeit muss nach der Startzeit liegen.')).toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });

  it('rejects a break starting before the workday start', () => {
    const { fill, submit } = renderForm();
    fill('07:00', '07:30');
    expect(screen.getByText(/Pause kann nicht vor Dienstbeginn \(08:00\) liegen\./)).toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });

  it('rejects a break overlapping an existing one', () => {
    const existing: FirebaseBreakRecord = { id: '1', start: at(12, 0), end: at(12, 30) };
    const { fill, submit } = renderForm([existing]);
    fill('12:15', '12:45');
    expect(screen.getByText('Diese Pause überschneidet sich mit einer bestehenden Pause.')).toBeInTheDocument();
    expect(submit()).toBeDisabled();
  });

  it('accepts a valid break and calls onAdd with the parsed times', async () => {
    const { onAdd, fill, submit } = renderForm();
    fill('09:00', '09:30');
    expect(submit()).toBeEnabled();

    await act(async () => {
      fireEvent.click(submit());
    });

    expect(onAdd).toHaveBeenCalledTimes(1);
    const [start, end] = onAdd.mock.calls[0];
    expect([start.getHours(), start.getMinutes()]).toEqual([9, 0]);
    expect([end.getHours(), end.getMinutes()]).toEqual([9, 30]);
  });
});
