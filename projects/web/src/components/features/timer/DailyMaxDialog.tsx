import { useState, useMemo } from 'react';
import { addMinutes, format } from 'date-fns';
import { WORK_TIME_TARGET_MINUTES, calculateAppliedBreakMinutes, calculateManualBreaksMinutes } from '@figo/shared';
import type { BreakRecord } from '@figo/shared';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

type Mode = 'saldo' | 'direct';

// ── Unsigned time (saldo tab — always positive) ─────────────────────────────

interface UnsignedTime {
  hours: number;
  minutes: number;
}

function unsignedToMinutes({ hours, minutes }: UnsignedTime): number {
  return hours * 60 + minutes;
}

function UnsignedTimeInput({
  value,
  onChange,
  label,
}: {
  value: UnsignedTime;
  onChange: (v: UnsignedTime) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow size="xs" className="text-muted-foreground">{label}</Eyebrow>
      <div className="flex items-center gap-1.5">
        <Input
          type="number"
          min={0}
          max={99}
          value={value.hours}
          onChange={e => onChange({ ...value, hours: Math.max(0, Math.min(99, parseInt(e.target.value) || 0)) })}
          className="w-14 text-center font-mono"
        />
        <span className="text-muted-foreground font-medium">Std</span>
        <Input
          type="number"
          min={0}
          max={59}
          value={value.minutes}
          onChange={e => onChange({ ...value, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
          className="w-14 text-center font-mono"
        />
        <span className="text-muted-foreground font-medium">Min</span>
      </div>
    </div>
  );
}

// ── Signed time (direct tab — can be negative) ───────────────────────────────

interface SignedTime {
  sign: '+' | '-';
  hours: number;
  minutes: number;
}

function signedToMinutes({ sign, hours, minutes }: SignedTime): number {
  const abs = hours * 60 + minutes;
  return sign === '-' ? -abs : abs;
}

function signedFromMinutes(totalMin: number): SignedTime {
  const abs = Math.abs(totalMin);
  return {
    sign: totalMin < 0 ? '-' : '+',
    hours: Math.floor(abs / 60),
    minutes: abs % 60,
  };
}

function SignedTimeInput({
  value,
  onChange,
  label,
}: {
  value: SignedTime;
  onChange: (v: SignedTime) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Eyebrow size="xs" className="text-muted-foreground">{label}</Eyebrow>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange({ ...value, sign: value.sign === '+' ? '-' : '+' })}
          className={cn(
            'flex h-9 w-10 shrink-0 items-center justify-center rounded-lg border text-sm font-bold transition-colors',
            value.sign === '-'
              ? 'border-destructive/50 bg-destructive/10 text-destructive'
              : 'border-primary/30 bg-primary/10 text-primary',
          )}
        >
          {value.sign}
        </button>
        <div className="flex items-center gap-1.5">
          <Input
            type="number"
            min={0}
            max={99}
            value={value.hours}
            onChange={e => onChange({ ...value, hours: Math.max(0, Math.min(99, parseInt(e.target.value) || 0)) })}
            className="w-14 text-center font-mono"
          />
          <span className="text-muted-foreground font-medium">Std</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={value.minutes}
            onChange={e => onChange({ ...value, minutes: Math.max(0, Math.min(59, parseInt(e.target.value) || 0)) })}
            className="w-14 text-center font-mono"
          />
          <span className="text-muted-foreground font-medium">Min</span>
        </div>
      </div>
    </div>
  );
}

// ── Dialog ───────────────────────────────────────────────────────────────────

interface DailyMaxDialogProps {
  open: boolean;
  onClose: () => void;
  startTime: Date;
  breaks: BreakRecord[];
  currentValue: number | null;
  onSave: (v: number) => void;
  onClear: () => void;
}

export function DailyMaxDialog({
  open,
  onClose,
  startTime,
  breaks,
  currentValue,
  onSave,
  onClear,
}: DailyMaxDialogProps) {
  const [mode, setMode] = useState<Mode>('saldo');

  // Initialise once when dialog opens
  const initialDirect = useMemo(
    () => signedFromMinutes(currentValue ?? 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [open],
  );

  const [direct, setDirect] = useState<SignedTime>(initialDirect);
  const [saldoCurrent, setSaldoCurrent] = useState<UnsignedTime>({ hours: 0, minutes: 0 });
  const [saldoMax, setSaldoMax] = useState<UnsignedTime>({ hours: 0, minutes: 0 });

  const maxOvertimeMinutes = useMemo(() => {
    if (mode === 'direct') return signedToMinutes(direct);
    return unsignedToMinutes(saldoMax) - unsignedToMinutes(saldoCurrent);
  }, [mode, direct, saldoCurrent, saldoMax]);

  const preview = useMemo(() => {
    const manualBreaksMin = calculateManualBreaksMinutes(breaks);
    const dailyMaxWorkMin = WORK_TIME_TARGET_MINUTES + maxOvertimeMinutes;
    const dailyMaxBreakMin = calculateAppliedBreakMinutes(dailyMaxWorkMin, manualBreaksMin);
    const endTime = addMinutes(startTime, dailyMaxWorkMin + dailyMaxBreakMin);
    return { endTime };
  }, [maxOvertimeMinutes, startTime, breaks]);

  const handleSave = () => {
    onSave(maxOvertimeMinutes);
    onClose();
  };

  const handleClear = () => {
    onClear();
    onClose();
  };

  const tabClass = (active: boolean) =>
    cn(
      'flex-1 rounded-lg py-1.5 text-sm font-medium transition-colors',
      active ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground',
    );

  return (
    <Dialog open={open} onOpenChange={onClose} title="Tages-Maximum">
      <div className="flex flex-col gap-5">
        <p className="text-sm text-muted-foreground">
          Begrenze deine Arbeitszeit heute, um Überstunden-Überlauf am Monatsende zu verhindern.
        </p>

        {/* Mode toggle */}
        <div className="flex gap-1 rounded-xl bg-muted p-1">
          <button type="button" className={tabClass(mode === 'saldo')} onClick={() => setMode('saldo')}>
            Aus Saldo
          </button>
          <button type="button" className={tabClass(mode === 'direct')} onClick={() => setMode('direct')}>
            Direkt eingeben
          </button>
        </div>

        {/* Input fields */}
        {mode === 'saldo' ? (
          <div className="flex flex-col gap-4">
            <UnsignedTimeInput
              label="Aktueller Gleitzeitsaldo"
              value={saldoCurrent}
              onChange={setSaldoCurrent}
            />
            <UnsignedTimeInput
              label="Maximaler Saldo"
              value={saldoMax}
              onChange={setSaldoMax}
            />
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            <SignedTimeInput
              label="Maximale Überstunden heute"
              value={direct}
              onChange={setDirect}
            />
            <p className="text-xs text-muted-foreground pl-0.5">
              Negativ = Feierabend vor regulärer Soll-Zeit
            </p>
          </div>
        )}

        {/* Live preview */}
        <div className="rounded-xl bg-muted/50 border border-border/50 px-4 py-3 flex flex-col gap-0.5">
          <p className="text-sm font-medium">
            {maxOvertimeMinutes >= 0
              ? `Noch ${maxOvertimeMinutes} Min. Überstunden möglich`
              : `${Math.abs(maxOvertimeMinutes)} Min. vor regulärem Feierabend`}
          </p>
          <p className="text-xs text-muted-foreground">
            Feierabend spätestens: {format(preview.endTime, 'HH:mm')}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Abbrechen
          </Button>
          {currentValue !== null && (
            <Button variant="outline" onClick={handleClear} className="text-destructive border-destructive/30 hover:bg-destructive/10">
              Zurücksetzen
            </Button>
          )}
          <Button onClick={handleSave} className="flex-1">
            Speichern
          </Button>
        </div>
      </div>
    </Dialog>
  );
}
