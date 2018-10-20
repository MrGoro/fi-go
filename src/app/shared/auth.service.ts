import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { UserService } from './user.service';

@Injectable()
export class AuthService {

  constructor(
   private afAuth: AngularFireAuth,
   private userService: UserService
  ) {}

  get authenticated(): boolean {
    return this.afAuth.authState !== null;
  }

  doFacebookLogin() {
    return new Promise<any>((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      });
    });
  }

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth.auth
      .signInWithPopup(provider)
      .then(res => {
        this.userService.updateUser(res.user);
        resolve(res);
      }, err => {
        console.log(err);
        reject(err);
      });
    });
  }

  doLogout() {
    return new Promise((resolve, reject) => {
      if (this.afAuth.auth.currentUser) {
        this.afAuth.auth.signOut();
        console.log('Logged out');
        resolve();
      } else {
        console.log('Logout rejected');
        console.log(this.afAuth.auth);
        reject();
      }
    });
  }
}
