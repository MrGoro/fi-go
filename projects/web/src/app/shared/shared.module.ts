import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { InfoDialog } from './info-dialog';
import { PhoneValidateDirectives } from './phone-validate.directives';

@NgModule({
  declarations: [
    InfoDialog,
    PhoneValidateDirectives
  ],
  imports: [
    CommonModule,
    MaterialModule
  ],
  entryComponents: [
    InfoDialog
  ],
  exports: [
    MaterialModule,
    PhoneValidateDirectives
  ]
})
export class SharedModule { }
