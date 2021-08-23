import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input/input.component';
import { DisplayComponent } from './display/display.component';
import { TimerRoutingModule } from './timer-routing.module';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';

@NgModule({
  declarations: [
    InputComponent,
    DisplayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TimerRoutingModule
  ]
})
export class TimerModule { }
