import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'ngx-moment';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './login/login.component';
import { InputComponent } from './input/input.component';
import { TimerComponent } from './timer/timer.component';
import { InfoDialog } from './shared/info-dialog';

import { AngularFireModule } from '@angular/fire';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { UserComponent } from './user/user.component';
import { PhoneLoginComponent } from './login/phone-login.component';
import { MaterialModule } from './material.module';
import { RoundProgressModule } from './round-progress/round-progress.module';

@NgModule({
  imports: [
    BrowserModule, NoopAnimationsModule, HttpClientModule,
    FormsModule, ReactiveFormsModule, AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule, AngularFireAuthModule,
    MaterialModule, MomentModule, RoundProgressModule
  ],
  declarations: [
    AppComponent, LoginComponent, PhoneLoginComponent,
    InputComponent, TimerComponent,
    InfoDialog, UserComponent
  ],
  entryComponents: [
    InfoDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
