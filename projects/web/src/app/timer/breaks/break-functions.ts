import { Break } from './breaks.service';
import { millisToDuration} from '../util/time-functions';
import { environment } from '../../../environments/environment';

export function calculateTotalDuration(breaks: Break[]): Duration {
  const totalMillis = breaks.map(element => element.end.getTime() - element.start.getTime())
    .reduce((a, b) => a + b, 0);

  if(totalMillis === 0) {
    return environment.timer.pause;
  }

  return millisToDuration(totalMillis);
}
