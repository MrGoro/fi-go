import { Pipe, PipeTransform } from '@angular/core';
import { TimeDuration } from './time-functions';

function pad(num: number | undefined): string {
  if(!num) return '00';
  const s = "0"+num;
  return s.substr(s.length-2);
}

@Pipe({
  name: 'timeDuration'
})
export class TimeDurationPipe implements PipeTransform {

  transform(value: TimeDuration, format: string = 'full'): unknown {
    const seconds = format === 'full' ? `:${pad(value?.seconds)}` : '';
    return `${value?.negative?'-':''}${pad(value?.hours)}:${pad(value?.minutes)}${seconds}`;
  }

}
