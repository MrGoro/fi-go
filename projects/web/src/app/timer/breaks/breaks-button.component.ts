import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreaksComponent } from './breaks.component';
import { AuthService } from '../../auth/util/auth.service';
import { DataService } from '../util/data.service';
import { map, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-breaks-button',
  template: `
    <button *ngIf="display" mat-icon-button (click)="openBreaks()">
      <mat-icon>lunch_dining</mat-icon>
    </button>
  `
})
export class BreaksButtonComponent implements OnInit {

  public display: boolean = false;

  constructor(
    private auth: AuthService,
    private data: DataService,
    private dialog: MatDialog
  ) {}

  openBreaks() {
    this.dialog.open(BreaksComponent, {});
  }

  ngOnInit(): void {
    this.auth.isLoggedIn().pipe(
      mergeMap(loggedIn => {
        if (loggedIn) {
          return this.data.get('startTime').pipe(
            map(data => data !== null)
          );
        } else {
          return of(false);
        }
      }),
    ).subscribe(display => {
      this.display = display;
    });
  }
}
