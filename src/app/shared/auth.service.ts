import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';
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

  doGoogleLogin() {
    return new Promise<any>((resolve, reject) => {
      const provider = new auth.GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      this.afAuth
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
      if (this.afAuth.currentUser) {
        this.afAuth.signOut();
        console.log('Logged out');
        resolve();
      } else {
        console.log('Logout rejected');
        console.log(this.afAuth);
        reject();
      }
    });
  }
}
