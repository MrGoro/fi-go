import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from "firebase/auth";

@Component({
  selector: 'app-user',
  template: `
    <div *ngIf="this.user">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <div *ngIf="this.user" mat-menu-item disabled><mat-icon>account_circle</mat-icon> {{ this.user?.phoneNumber }}</div>
        <button *ngIf="this.user" mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
      </mat-menu>
    </div>
  `,
  styles: []
})
export class UserComponent implements OnInit {

  public user: User | undefined;

  constructor(
    private router: Router,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        this.user = user;
      } else {
        this.user = undefined;
      }
    });
  }

  logout() {
    this.auth.signOut()
      .then(() => {
        this.user = undefined;
        this.router.navigate(['/auth/login']);
      }, (error) => {
        console.log('Logout error', error);
      });
  }
}
