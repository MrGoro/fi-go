import { format } from 'date-fns';
import type { BreakRecord } from '@figo/shared';
import { Surface } from '@/components/ui/surface';
import { StatCell } from '@/components/ui/stat-cell';
import { useTimerCalculations } from '@/hooks/useTimerCalculations';
import { TimerRing } from './TimerRing';
import { SaldoCenter } from './SaldoCenter';

interface DisplayScreenProps {
  startTime: Date;
  breaks: BreakRecord[];
  maxOvertimeMinutes?: number | null;
  liveBreakStart?: Date | null;
}

export function DisplayScreen({ startTime, breaks, maxOvertimeMinutes, liveBreakStart }: DisplayScreenProps) {
  const {
    manualBreaksMin,
    appliedBreaksMin,
    ringMaxMin,
    segments,
    hintSlots,
    breakHoverItems,
    sollAngle,
    tenAngle,
    finishTime,
    tenLimitTime,
    dailyMaxAngle,
    dailyMaxLimitTime,
    saldoText,
    isOvertime,
    workdayMsg,
    grossMin,
  } = useTimerCalculations(startTime, breaks, maxOvertimeMinutes, liveBreakStart);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 w-full px-5 py-6 animate-in fade-in duration-700">
      <TimerRing
        grossMin={grossMin}
        ringMaxMin={ringMaxMin}
        segments={segments}
        hintSlots={hintSlots}
        breakHoverItems={breakHoverItems}
        sollAngle={sollAngle}
        sollLabel={format(finishTime, 'HH:mm')}
        tenAngle={tenAngle}
        tenLabel={format(tenLimitTime, 'HH:mm')}
        dailyMaxAngle={dailyMaxAngle}
        dailyMaxLabel={dailyMaxLimitTime ? format(dailyMaxLimitTime, 'HH:mm') : undefined}
      >
        <SaldoCenter saldoText={saldoText} isOvertime={isOvertime} message={workdayMsg} />
      </TimerRing>

      <Surface variant="card" className="w-full max-w-sm">
        <div className="grid grid-cols-2 divide-x divide-white/80 dark:divide-neutral-700/60">
          <StatCell label="Start" value={format(startTime, 'HH:mm')} />
          <StatCell
            label="Pause"
            value={`${appliedBreaksMin} Min`}
            hint={appliedBreaksMin > manualBreaksMin ? `inkl. ${appliedBreaksMin - manualBreaksMin} min gesetzl.` : undefined}
          />
        </div>
      </Surface>
    </div>
  );
}
