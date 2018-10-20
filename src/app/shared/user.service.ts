import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { AngularFirestore, AngularFirestoreDocument } from '@angular/fire/firestore';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { FirebaseUserModel } from './firebaseuser.model';

@Injectable()
export class UserService {

  constructor(
   private db: AngularFirestore,
   private afAuth: AngularFireAuth
  ) {}

  getCurrentUser(): Promise<FirebaseUserModel> {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.auth.onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
          const user: FirebaseUserModel = this.map(firebaseUser);
          console.log('Current User: ' + JSON.stringify(user));
          resolve(user);
        } else {
          reject('No user logged in');
        }
      });
    });
  }

  updateUser(firebaseuser: firebase.User): void {
    const uid: string = firebaseuser.uid;
    const user: FirebaseUserModel = this.map(firebaseuser);

    const userRef: AngularFirestoreDocument<FirebaseUserModel> = this.db.doc<FirebaseUserModel>('users/' + uid);
    userRef.set(user);
    console.log('Updating User:' + JSON.stringify(user));
  }

  map(user: firebase.User): FirebaseUserModel {
    if (user) {
      return {
        name: user.displayName,
        email: user.email,
        image: user.photoURL,
        provider: user.providerId
      };
    } else {
      return null;
    }
  }
}
