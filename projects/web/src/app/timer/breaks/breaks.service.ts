import { Injectable } from '@angular/core';
import { DataService } from '../util/data.service';
import { format, intervalToDuration } from 'date-fns';
import { filter, map, mergeMap } from 'rxjs/operators';
import { push, remove, set } from '@angular/fire/database';
import { Observable } from 'rxjs';

const propertyName = 'breaks';

export interface Break {
  id: string;
  start: Date;
  end: Date;
}

@Injectable({
  providedIn: 'root'
})
export class BreaksService {

  constructor(private data: DataService) { }

  getBreaks(): Observable<Break[]> {
    return this.data.list(propertyName).pipe(
      filter(snapshots => snapshots !== null),
      map(snapshots => snapshots.filter(snapshot => snapshot.key !== null)),
      map(snapshots => {
        return snapshots.map(snapshot => {
          const startTime = new Date(snapshot.val().start);
          const endTime = new Date(snapshot.val().end);
          return {
            id: snapshot.key || '',
            start: startTime,
            end: endTime,
            duration: intervalToDuration({start: startTime, end: endTime})
          };
        });
      })
    );
  }

  addBreak(start: Date, end: Date): Observable<void> {
    console.debug(`Adding break from ${format(start, 'HH:mm')} to ${format(end, 'HH:mm')}`);
    return this.data.listRef(propertyName).pipe(
      map(listRef => push(listRef)),
      mergeMap(pushRef => set(pushRef, {
        start: start.getTime(),
        end: end.getTime()
      }))
    );
  }

  deleteBreak(id: string): Observable<void> {
    console.debug(`Deleting break ${id}`);
    return this.data.listElement(propertyName, id).pipe(
      mergeMap(listRef => remove(listRef)),
    );
  }
}
