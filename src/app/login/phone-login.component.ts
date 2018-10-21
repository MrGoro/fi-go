import { Component, OnInit } from '@angular/core';
import { PhoneNumber } from './phone-number';
import { WindowService } from '../shared/window.service';
import { AngularFireAuth } from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import { UserService } from '../shared/user.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.css']
})
export class PhoneLoginComponent implements OnInit {

  public recaptchaOk = false;
  public codeSent = false;

  windowRef: any;
  phoneNumber: string;
  verificationCode: string;

  constructor(private win: WindowService,
              private userService: UserService,
              private afAuth: AngularFireAuth,
              private router: Router) { }

  ngOnInit() {
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container');
    // this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    //   // 'size': 'invisible',
    //   'callback': (response) => {
    //     this.recaptchaOk = true;
    //     console.log('Recaptcha OK');
    //   },
    //   'expired-callback': () => {
    //     this.recaptchaOk = false;
    //     console.log('Recaptcha failed');
    //   }
    // });
    this.windowRef.recaptchaVerifier.render();
  }

  sendLoginCode() {
    const appVerifier = this.windowRef.recaptchaVerifier;
    const num = `+49${this.phoneNumber}`;

    this.afAuth.auth.signInWithPhoneNumber(num, appVerifier)
                    .then(result => {
                      this.windowRef.confirmationResult = result;
                      this.codeSent = true;
                    })
                    .catch( error => console.log(error) );
  }

  verifyLoginCode() {
    this.windowRef.confirmationResult
                  .confirm(this.verificationCode)
                  .then( res => {
                    console.log('Logged in with Phone');
                    this.userService.updateUser(res.user);
                    this.router.navigate(['/']);
                  })
    .catch( error => {
      console.log(error, 'Incorrect code entered?');
    });
  }

  reset(): void {
    this.codeSent = false;
    t#his.windowRef.confirmationResult = null;
  }
}
