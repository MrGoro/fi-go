import { Injectable } from '@angular/core';
import { Database, onValue, DataSnapshot, ref, set } from '@angular/fire/database';
import { DatabaseReference } from "firebase/database";
import { bindCallback, from, Observable } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private db: Database, private authService: AuthService) { }

  set(key: string, value: any): Observable<void> {

    const data: any = {};
    data[key] = value;

    return this.getRef().pipe(
      map(dbRef => set(dbRef, data)),
      switchMap(result => from(result))
    );
  }

  get(key: string): Observable<any> {
    return this.getRef().pipe(
      switchMap(dbRef => this.getSnapshot(dbRef)),
      map((snapshot: DataSnapshot) => snapshot.val()),
      map(value => value ? value[key] : null),
    );
  }

  getSnapshot(dbRef: DatabaseReference): Observable<DataSnapshot> {
    return new Observable(subscriber => {
      onValue(dbRef, (snapshot) => {
        subscriber.next(snapshot);
      });
    });
  }

  setDate(key: string, date: Date): Observable<void> {
    return this.set(key, date.getTime());
  }

  getDate(key: string): Observable<Date> {
    return this.get(key).pipe(
      map(time => new Date(time))
    );
  }

  getRef(): Observable<DatabaseReference> {
    return this.authService.getUser().pipe(
      map(user => `data/${user?.uid}`),
      map(dbRef => ref(this.db, dbRef))
    )
  }
}
