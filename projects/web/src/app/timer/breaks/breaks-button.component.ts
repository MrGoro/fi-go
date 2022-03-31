import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreaksComponent } from './breaks.component';
import { AuthService } from '../../auth/util/auth.service';
import { DataService } from '../util/data.service';

@Component({
  selector: 'app-breaks-button',
  template: `
    <button *ngIf="loggedIn && startTimePresent" mat-icon-button (click)="openBreaks()">
      <mat-icon>lunch_dining</mat-icon>
    </button>
  `
})
export class BreaksButtonComponent implements OnInit {

  public loggedIn: boolean = false;
  public startTimePresent: boolean = false;

  constructor(
    private auth: AuthService,
    private data: DataService,
    private dialog: MatDialog
  ) {}

  openBreaks() {
    this.dialog.open(BreaksComponent, {});
  }

  ngOnInit(): void {
    this.auth.isLoggedIn().subscribe(loggedIn => {
      this.loggedIn = loggedIn;
    });
    this.data.get('startTime').subscribe(startTime => {
      this.startTimePresent = startTime !== null;
    });
  }
}
