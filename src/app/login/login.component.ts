import { Component, OnInit } from '@angular/core';
import {DomSanitizer} from '@angular/platform-browser';
import {MatIconRegistry} from '@angular/material';
import { Router, Params } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../shared/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public loginForm: FormGroup;
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

    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.loginForm = this.fb.group({
      email: ['', Validators.required ],
      password: ['', Validators.required]
    });
  }

  tryGoogleLogin() {
    this.authService.doGoogleLogin()
    .then(res => {
      this.router.navigate(['/']);
    });
  }

}
