import { database } from 'firebase-admin';
import DataSnapshot = database.DataSnapshot;
import { intervalToDuration } from 'date-fns';

const propertyName = 'breaks';

export interface Break {
  id: string;
  start: Date;
  end: Date;
}

export function extractBreaks(snapshot: DataSnapshot): Break[] {
  const breaks: Break[] = [];
  const list = snapshot.child(propertyName);
  if(list.exists()) {
    list.forEach((dataSnapshot: DataSnapshot) => {
      breaks.push({
        id: snapshot.key || '',
        start: new Date(dataSnapshot.val().start),
        end: new Date(dataSnapshot.val().end)
      });
    });
  }
  return breaks;
}

export function getPause(breaks: Break[], defaultPause: Duration): Duration {
  if(breaks.length === 0) {
    return defaultPause;
  }
  return calculateTotalDuration(breaks);
}

export function calculateTotalDuration(breaks: Break[]): Duration {
  const totalMillis = breaks.map(element => element.end.getTime() - element.start.getTime())
    .reduce((a, b) => a + b, 0);
  return millisToDuration(totalMillis);
}

export function millisToDuration(millis: number): Duration {
  return intervalToDuration({start: new Date(0), end: new Date(millis)});
}
