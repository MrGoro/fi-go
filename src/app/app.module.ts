import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule} from '@angular/forms';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatInputModule} from '@angular/material';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MomentModule} from 'ngx-moment';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import {InputComponent} from './input/input.component';
import {TimerComponent} from './timer/timer.component';
import {InfoDialog} from './shared/info-dialog';

import * as moment from 'moment';

@NgModule({
  imports: [
    BrowserModule, FormsModule, NoopAnimationsModule, AppRoutingModule,
    MatButtonModule, MatInputModule, MatToolbarModule, MatIconModule,
    MatDialogModule,
    RoundProgressModule,
    MomentModule
  ],
  declarations: [
    AppComponent, InputComponent, TimerComponent, InfoDialog
  ],
  entryComponents: [
    InfoDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
