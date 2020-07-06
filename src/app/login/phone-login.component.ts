import {ApplicationRef, Component, OnInit} from '@angular/core';
import {WindowService} from '../shared/window.service';
import {AngularFireAuth} from '@angular/fire/auth';
import * as firebase from 'firebase/app';
import 'firebase/auth';
import {UserService} from '../shared/user.service';
import {Router} from '@angular/router';

declare var grecaptcha: any;

@Component({
  selector: 'app-phone-login',
  templateUrl: './phone-login.component.html',
  styleUrls: ['./phone-login.component.css']
})
export class PhoneLoginComponent implements OnInit {

  public error: string;
  public codeSent = false;
  public phoneNumber: string;
  public verificationCode: number;

  private windowRef: any;
  private recaptchaWidgetId: number;

  constructor(private win: WindowService,
              private userService: UserService,
              private afAuth: AngularFireAuth,
              private router: Router,
              private appRef: ApplicationRef) {
  }

  ngOnInit() {
    this.windowRef = this.win.windowRef;
    this.afAuth.useDeviceLanguage();
    this.afAuth
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('get-login-code-button', {
      'size': 'invisible',
      'callback': () => {
        this.sendLoginCode();
      }
    });
    this.windowRef.recaptchaVerifier.render().then(widgetId => {
      this.recaptchaWidgetId = widgetId;
    });
  }

  sendLoginCode() {
    const appVerifier = this.windowRef.recaptchaVerifier;
    const num = `+49${this.phoneNumber}`;

    this.afAuth.signInWithPhoneNumber(num, appVerifier)
      .then(result => {
        this.windowRef.confirmationResult = result;
        this.codeSent = true;
        this.appRef.tick();
      })
      .catch(error => {
        console.log(JSON.stringify(error));
        if(error.code === 'auth/invalid-phone-number') {
          this.reset('Die eingegebene Telefonnummer ist ungültig!')
        } else {
          this.reset('Es ist ein Fehler aufgetreten!');
        }
        this.appRef.tick();
      });
  }

  verifyLoginCode() {
    let code: string = this.verificationCode.toString();
    this.windowRef.confirmationResult
      .confirm(code)
      .then(res => {
        console.log('Logged in with Phone');
        this.userService.updateUser(res.user);
        console.log('Redirect to /');
        this.router.navigate(['/']);
      })
      .catch(error => {
        if(error.code === 'auth/invalid-verification-code') {
          this.error = 'Der eingegebene Login-Code war leider falsch!'
        } else {
          this.error = 'Es ist ein Fehler aufgetreten! Code: ' + error.code;
        }
      });
  }

  reset(error: string): void {
    this.error = error;
    this.codeSent = false;
    this.windowRef.confirmationResult = null;
    // Reset Recaptcha to allow user to solve it again
    grecaptcha.reset(this.recaptchaWidgetId);
  }
}
