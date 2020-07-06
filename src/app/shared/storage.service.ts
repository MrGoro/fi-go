import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { filter, map, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth) {
  }

  set(key: string, value: any): Observable<void> {
    const data = {};
    data[key] = value;
    return this.getRef().pipe(
      mergeMap(ref => ref.set(data))
    );
  }

  get(key: string): Observable<any> {
    return this.getRef().pipe(
      mergeMap(ref => ref.valueChanges()),
      map(x => {
        if (x) {
          return x[key]
        }
        return null;
      })
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

  getRef(): Observable<AngularFireObject<any>> {
    return this.afAuth.authState.pipe(
      filter(user => !!user),
      map(user => user.uid),
      map(uid => this.db.object<any>('data/' + uid))
    );
  }
}
