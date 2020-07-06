import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { FirebaseUserModel, User } from './firebaseuser.model';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';

@Injectable()
export class UserService {

  constructor(
    private db: AngularFireDatabase,
    private afAuth: AngularFireAuth
  ) {
  }

  getCurrentUser(): Promise<FirebaseUserModel> {
    return new Promise<any>((resolve, reject) => {
      this.afAuth.onAuthStateChanged(firebaseUser => {
        if (firebaseUser) {
          const user: FirebaseUserModel = UserService.map(firebaseUser);
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
    const user: FirebaseUserModel = UserService.map(firebaseuser);
    console.log('Updating User: ' + JSON.stringify(user) + ' / UID: ' + uid);
    const userRef: AngularFireObject<FirebaseUserModel> = this.db.object<FirebaseUserModel>('users/' + uid);
    userRef.set(Object.assign({}, user)).then(() =>
      console.log('Update Successful.')
    );
  }

  static map(user: firebase.User): FirebaseUserModel {
    if (user) {
      return new User(
        user.displayName,
        user.email,
        user.phoneNumber,
        user.photoURL,
        user.providerId
      );
    } else {
      return null;
    }
  }
}
