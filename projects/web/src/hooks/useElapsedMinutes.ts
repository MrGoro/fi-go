import { useEffect, useState } from 'react';
import { calculateElapsedMinutes } from '@figo/shared';

/** Ticks every second and returns the elapsed minutes since `since`. */
export function useElapsedMinutes(since: Date): number {
  const [elapsed, setElapsed] = useState(() => calculateElapsedMinutes(since));
  useEffect(() => {
    const id = setInterval(() => setElapsed(calculateElapsedMinutes(since)), 1000);
    return () => clearInterval(id);
  }, [since]);
  return elapsed;
}
