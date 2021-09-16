import { Injectable } from '@angular/core';
import { Database, ref, set, objectVal } from '@angular/fire/database';
import { DatabaseReference } from "firebase/database";
import { from, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { AuthService } from '../../auth/util/auth.service';

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

  getAll(): Observable<{[key: string]: any}> {
    return this.getRef().pipe(
      switchMap(dbRef => objectVal<any>(dbRef))
    );
  }

  get(key: string): Observable<any> {
    return this.getAll().pipe(
      map(value => value ? value[key] : null)
    );
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
