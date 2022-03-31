import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { versions } from '../../environments/versions';

@Component({
  selector: 'info-dialog',
  template: `
        <h1 mat-dialog-title>Über fi go!</h1>
        <mat-dialog-content>
          <p>Arbeitszeitrechner als Angular-Webapp auf der Firebase-Plattform:</p>
          <ul>
            <li>Login mit Firebase Auth</li>
            <li>Datenspeicherung in Firebase Realtime Database</li>
            <li>Push-Notifications über Firebase Functions & Cloud Messaging</li>
            <li>Hosting der Anwendung über Firebase Hosting</li>
          </ul>
          <table>
            <tr class="header"><td colspan="2">Verwendete Zeiten</td></tr>
            <tr><td>Arbeitszeit:</td><td>7:48 Stunden</td></tr>
            <tr><td>Pause:</td><td>30 Minuten nach Ablauf von 6 Stunden</td></tr>
            <tr><td>Warnung:</td><td>vor 10-Stunden-Grenze nach 9:30 Stunden</td></tr>
            <tr class="header"><td colspan="2">Versions-Informationen</td></tr>
            <tr><td>Version:</td><td>{{versions.version}}</td></tr>
            <tr><td>Revision:</td><td>{{versions.revision}}</td></tr>
            <tr><td>Branch:</td><td>{{versions.branch}}</td></tr>
            <tr><td>Build:</td><td>{{versions.buildTime}}</td></tr>
          </table>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
          <iframe src="https://ghbtns.com/github-btn.html?user=MrGoro&type=follow&size=large" frameborder="0" scrolling="0" width="230" height="30" title="GitHub"></iframe>
          <iframe src="https://ghbtns.com/github-btn.html?user=MrGoro&repo=fi-go&type=star&size=large" frameborder="0" scrolling="0" width="170" height="30" title="GitHub"></iframe>
          <button mat-button mat-dialog-close>Schließen</button>
        </mat-dialog-actions>`,
  styles: [`
    .header {
      font-weight: bold;
      line-height: 3em;
    }
  `]
})
export class InfoDialog {

  public versions = versions;

  constructor(public dialogRef: MatDialogRef<InfoDialog>) {}
}
