import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public phoneLogin = false;
  errorMessage = '';

  constructor(private _iconRegistry: MatIconRegistry,
              private _sanitizer: DomSanitizer,
              public authService: AuthService,
              private router: Router,
              private fb: FormBuilder) {
    _iconRegistry
      .addSvgIcon('google', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/google.svg'))
      .addSvgIcon('google-colored', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/google-colored.svg'))
      .addSvgIcon('facebook', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/facebook.svg'))
      .addSvgIcon('twitter', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/twitter.svg'))
      .addSvgIcon('github', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/github-circle.svg'))
      .addSvgIcon('phone', _sanitizer.bypassSecurityTrustResourceUrl('/assets/providers/phone.svg'));
  }

  ngOnInit() {
  }

  tryGoogleLogin() {
    this.authService.doGoogleLogin()
      .then(res => {
        this.router.navigate(['/']);
      });
  }

}
