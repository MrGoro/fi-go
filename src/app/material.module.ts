import {NgModule} from '@angular/core';

import {
  MatSidenavModule,
  MatToolbarModule,
  MatIconModule,
  MatListModule,
  MatInputModule,
  MatButtonModule,
  MatCardModule,
  MatStepperModule,
  MatRadioModule,
  MatDialogModule,
  MatMenuModule,
  MatTooltipModule
} from '@angular/material';

@NgModule({
  imports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
  ],
  exports: [
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatStepperModule,
    MatRadioModule,
    MatDialogModule,
    MatMenuModule,
    MatTooltipModule
  ]
})
export class MaterialModule {}
