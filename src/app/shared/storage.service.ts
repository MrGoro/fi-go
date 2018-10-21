import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private db: AngularFirestore,
    private afAuth: AngularFireAuth) { }

  set(key: string, value: any): Promise<void> {
    const data = {};
    data[key] = value;
    return this.getRef().set(data, {merge: true});
  }

  get(key: string): Observable<any> {
    return this.getRef().valueChanges().pipe(
      map(x => x[key])
    );
  }

  setDate(key: string, date: Date): Promise<void> {
    return this.set(key, date.getTime());
  }

  getDate(key: string): Observable<Date> {
    return this.get(key).pipe(
      map(time => new Date(time))
    );
  }

  getRef(): AngularFirestoreDocument {
    const uid: string = this.afAuth.auth.currentUser.uid;
    const ref: AngularFirestoreDocument<any> = this.db.doc<any>('data/' + uid);
    return ref;
  }
}
