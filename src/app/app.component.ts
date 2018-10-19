import { Component } from '@angular/core';
import { InfoDialog } from "./shared/info-dialog";

import { MatDialog, MatDialogRef } from "@angular/material/dialog";

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  constructor(
    private dialog: MatDialog
  ) {}

  public info() {
    let dialogRef: MatDialogRef<InfoDialog> = this.dialog.open(InfoDialog, {});
  }
}
