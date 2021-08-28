import { ApplicationRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { WindowService } from '../../shared/window.service';
import { ConfirmationResult, RecaptchaVerifier, UserCredential } from "firebase/auth";
import { Auth, signInWithPhoneNumber } from '@angular/fire/auth';

declare var grecaptcha: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  @ViewChild('codeInput') codeInput!: ElementRef;

  public error!: string;
  public loading = false;
  public codeSent = false;
  public phoneNumber!: string;
  public verificationCode!: number;

  private windowRef: any;
  private confirmationResult!: ConfirmationResult;

  constructor(
    private router: Router,
    private auth: Auth,
    private windowService: WindowService,
    private appRef: ApplicationRef) { }

  ngOnInit(): void {
    this.windowRef = this.windowService.windowRef;
    this.initAuth();
  }

  initAuth() {
    this.auth.useDeviceLanguage();
    this.windowRef.recaptchaVerifier = new RecaptchaVerifier('get-login-code-button', {'size': 'invisible'}, this.auth);
  }

  getLoginCode() {
    const phone = this.phone;
    const verifier = this.windowRef.recaptchaVerifier;

    console.log(`Request Login-Code for ${phone}`);

    this.loading = true;
    signInWithPhoneNumber(this.auth, phone, verifier)
      .then((confirmationResult: ConfirmationResult) => {
        this.confirmationResult = confirmationResult;
        this.codeSent = true;
        this.loading = false;
        this.appRef.tick();
        this.codeInput?.nativeElement.focus();
      }).catch((error) => {
        console.log(JSON.stringify(error));
        if (error.code === 'auth/invalid-phone-number') {
          this.reset('Die eingegebene Telefonnummer ist ungültig!')
        } else {
          this.reset('Es ist ein Fehler aufgetreten!');
        }
        this.loading = false;
        this.appRef.tick();
      });
  }

  verifyLoginCode() {
    this.loading = true;
    this.confirmationResult.confirm(`${this.verificationCode}`).then((result: UserCredential) => {
      console.log('Sign-in successful!');
      const user = result.user;
      console.log(user);
      this.router.navigate(['/']);
    }).catch((error: any) => {
      if (error.code === 'auth/invalid-verification-code') {
        this.error = 'Der eingegebene Login-Code war leider falsch!'
      } else {
        this.error = 'Es ist ein Fehler aufgetreten! Code: ' + error.code;
      }
      this.loading = false;
    });
  }

  get phone(): string {
    return this.phoneNumber !== undefined ? `+49${this.phoneNumber}` : '';
  }

  reset(error: string): void {
    this.error = error;
    this.codeSent = false;
    this.windowRef.confirmationResult = null;
    this.windowRef.recaptchaVerifier.render().then((widgetId: string) => {
      grecaptcha.reset(widgetId);
    });
    this.loading = false;
  }

  doNothing() {
    console.log('Nothing!');
  }
}
