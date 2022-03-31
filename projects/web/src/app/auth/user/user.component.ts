import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { onAuthStateChanged, User } from "firebase/auth";
import { MatDialog } from '@angular/material/dialog';
import { InfoDialog } from 'projects/web/src/app/shared/info-dialog';

@Component({
  selector: 'app-user',
  template: `
    <div *ngIf="this.user">
      <button mat-icon-button [matMenuTriggerFor]="menu">
        <mat-icon>account_circle</mat-icon>
      </button>
      <mat-menu #menu="matMenu">
        <div mat-menu-item disabled><mat-icon>phone</mat-icon> {{ this.user?.phoneNumber }}</div>
        <a mat-menu-item href="https://github.com/MrGoro/fi-go/issues/new" target="_blank"><mat-icon>bug_report</mat-icon> Fehler melden</a>
        <button mat-menu-item (click)="info()"><mat-icon>info</mat-icon> Über fi go!</button>
        <button mat-menu-item (click)="logout()"><mat-icon>logout</mat-icon> Logout</button>
      </mat-menu>
    </div>
  `,
  styles: []
})
export class UserComponent implements OnInit {

  public user: User | undefined;

  constructor(
    private router: Router,
    private auth: Auth,
    private dialog: MatDialog
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

  info() {
    this.dialog.open(InfoDialog, {});
  }
}
