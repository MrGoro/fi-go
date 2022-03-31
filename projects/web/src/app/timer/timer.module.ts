import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InputComponent } from './input/input.component';
import { DisplayComponent } from './display/display.component';
import { TimerRoutingModule } from './timer-routing.module';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../shared/material.module';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { TimeDurationPipe } from './util/time-duration.pipe';
import { BreaksComponent } from './breaks/breaks.component';
import { BreaksButtonComponent } from './breaks/breaks-button.component';
import { BreaksListComponent } from './breaks/breaks-list.component';
import { DurationValidationDirective } from './util/duration-validation.directive';

@NgModule({
  declarations: [
    InputComponent,
    DisplayComponent,
    TimeDurationPipe,
    BreaksComponent,
    BreaksListComponent,
    BreaksButtonComponent,
    DurationValidationDirective
  ],
  exports: [
    BreaksComponent,
    BreaksButtonComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    RoundProgressModule,
    TimerRoutingModule
  ]
})
export class TimerModule { }
