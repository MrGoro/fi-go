import { Break, BreaksService } from './breaks.service';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, catchError, finalize, Observable, of } from 'rxjs';
import { TimeDuration, toTimeDuration } from '../util/time-functions';
import { environment } from '../../../environments/environment';
import { calculateTotalDuration } from './break-functions';

export class BreaksDatasource implements DataSource<Break> {

  private readonly breaksSubject = new BehaviorSubject<Break[]>([]);
  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  public readonly loading$ = this.loadingSubject.asObservable();

  public totalDuration: TimeDuration = toTimeDuration(environment.timer.pause);

  constructor(private service: BreaksService) {}

  connect(collectionViewer: CollectionViewer): Observable<Break[]> {
    return this.breaksSubject.asObservable();
  }

  disconnect(collectionViewer: CollectionViewer): void {
    this.breaksSubject.complete();
    this.loadingSubject.complete();
  }

  loadBreaks() {
    this.loadingSubject.next(true);
    this.service.getBreaks().pipe(
      catchError(() => of([])),
      finalize(() => this.loadingSubject.next(false))
    ).subscribe(breaks => this.dataUpdated(breaks));
  }

  dataUpdated(breaks: Break[]) {
    this.breaksSubject.next(breaks);
    this.totalDuration = toTimeDuration(calculateTotalDuration(breaks));
  }
}
