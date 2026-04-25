import { Eyebrow } from './eyebrow';

interface StatCellProps {
  label: string;
  value: string;
  hint?: string;
}

/**
 * Vertikal gestapelte Label/Wert-Zelle. Im Timer als 2-Spalten-Info-Card
 * eingesetzt, könnte auch im About-Dialog als Key/Value-Darstellung dienen.
 */
export function StatCell({ label, value, hint }: StatCellProps) {
  return (
    <div className="flex flex-col items-center px-4 py-3.5">
      <Eyebrow size="xs" className="mb-1.5 text-muted-foreground/60">
        {label}
      </Eyebrow>
      <span className="text-[17px] font-semibold tabular-nums text-foreground leading-none">
        {value}
      </span>
      {hint && (
        <span className="text-[10px] text-muted-foreground/55 mt-1 tracking-tight">
          {hint}
        </span>
      )}
    </div>
  );
}
