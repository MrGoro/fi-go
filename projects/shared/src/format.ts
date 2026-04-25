import type { TimeDuration } from './types';

export function minutesToTimeDuration(minutes: number): TimeDuration {
  const negative   = minutes < 0;
  const absMinutes = Math.floor(Math.abs(minutes));
  return {
    hours:   Math.floor(absMinutes / 60),
    minutes: Math.floor(absMinutes % 60),
    seconds: 0,
    negative,
  };
}

export function millisToTimeDuration(millis: number): TimeDuration {
  const negative     = millis < 0;
  const absMillis    = Math.floor(Math.abs(millis));
  const totalSeconds = Math.floor(absMillis / 1000);
  return {
    hours:   Math.floor(totalSeconds / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
    negative,
  };
}
