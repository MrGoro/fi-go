import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { InfoDialog } from './info-dialog';

@NgModule({
  declarations: [
    InfoDialog
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  entryComponents: [
    InfoDialog
  ],
  exports: [
    MaterialModule
  ]
})
export class SharedModule { }
