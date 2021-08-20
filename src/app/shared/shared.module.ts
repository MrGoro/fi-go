import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoundProgressModule } from './round-progress/round-progress.module';
import { MaterialModule } from './material.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RoundProgressModule,
  ],
  exports: [
    RoundProgressModule,
    MaterialModule
  ]
})
export class SharedModule { }
