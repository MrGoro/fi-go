import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BreaksComponent } from './breaks.component';

@Component({
  selector: 'app-breaks-button',
  template: `
    <button mat-icon-button (click)="openBreaks()">
      <mat-icon>lunch_dining</mat-icon>
    </button>
  `
})
export class BreaksButtonComponent {

  constructor(private dialog: MatDialog) {}

  openBreaks() {
    this.dialog.open(BreaksComponent, {});
  }
}
