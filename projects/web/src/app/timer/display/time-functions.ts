import { add, isYesterday, startOfDay, sub } from 'date-fns';

export interface TimeDuration {
  hours?: number;
  minutes?: number;
  seconds?: number;
  negative: boolean;
}

export function durationToMillis(duration: Duration): number {
  return add(new Date(0), duration).getTime();
}

export function toTimeDuration(duration: Duration): TimeDuration {
  return {
    hours: duration.hours,
    minutes: duration.minutes,
    seconds: duration.seconds,
    negative: false
  };
}

export function subDurations(dur1: Duration, dur2: Duration): TimeDuration {
  let minus = sub(add(startOfDay(new Date()), dur1), dur2);
  let negative = isYesterday(minus);
  if(negative) {
    minus = sub(add(startOfDay(new Date()), dur2), dur1);
  }

  return {
    hours: minus.getHours(),
    minutes: minus.getMinutes(),
    seconds: minus.getSeconds(),
    negative: negative
  };
}
