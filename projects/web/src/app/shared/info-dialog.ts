import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { versions } from '../../environments/versions';

@Component({
  selector: 'info-dialog',
  template: `
        <h2 mat-dialog-title>Über fi go!</h2>
        <mat-dialog-content class="mat-typography">
        Arbeitszeit: 7:48 Stunden<br />
        Pause: 30 Minuten nach Ablauf von 6 Stunden<br />
        Warnung vor 10-Stunden-Grenze nach 9:30 Stunden<br /><br />
        Version: {{versions.version}}<br />
        Revision: {{versions.revision}}<br />
        Branch: {{versions.branch}}<br />
        Build: {{versions.buildTime}}<br />
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <button mat-button mat-dialog-close>Schließen</button>
        </mat-dialog-actions>`,
  styles: []
})
export class InfoDialog implements OnInit {

  public versions = versions;

  constructor(public dialogRef: MatDialogRef<InfoDialog>) {
  }

  ngOnInit() {
  }

}