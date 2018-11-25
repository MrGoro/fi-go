import {Injectable} from '@angular/core';
import {AngularFirestore, AngularFirestoreDocument} from '@angular/fire/firestore';
import {AngularFireAuth} from '@angular/fire/auth';
import {flatMap, map} from 'rxjs/operators';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth) { }

  set(key: string, value: any): Observable<void> {
    const data = {};
    data[key] = value;
    return this.getRef().pipe(
      flatMap(ref => ref.set(data, {merge: true}))
    );
  }

  get(key: string): Observable<any> {
    return this.getRef().pipe(
      flatMap(ref => ref.valueChanges()),
      map(x => {
        if(x) {
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

  getRef(): Observable<AngularFirestoreDocument> {
    return this.afAuth.authState.pipe(
      map(user => user.uid),
      map(uid => this.db.doc<any>('data/' + uid))
    );
  }
}
