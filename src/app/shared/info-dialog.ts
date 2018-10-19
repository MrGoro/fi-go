import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'info-dialog',
  template: `
        <h2 mat-dialog-title>Über fi go!</h2>
        Arbeitszeit: 7:48 Stunden<br />
        Pause: 30 Minuten nach Ablauf von 6 Stunden<br />
        Warnung vor 10-Stunden-Grenze nach 9:30 Stunden<br />
        <div mat-dialog-actions>
            <button mat-button (click)="dialogRef.close(true)">CLOSE</button>
        </div>`,
  styles: []
})
export class InfoDialog implements OnInit {

  constructor(public dialogRef: MatDialogRef<InfoDialog>) {
  }

  ngOnInit() {
  }

}