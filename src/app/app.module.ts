import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MomentModule } from 'ngx-moment';
import { RoundProgressModule } from 'angular-svg-round-progressbar';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { LoginComponent } from './login/login.component';
import { InputComponent } from './input/input.component';
import { TimerComponent } from './timer/timer.component';
import { InfoDialog } from './shared/info-dialog';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from '../environments/environment';
import { AuthService } from './shared/auth.service';
import { UserService } from './shared/user.service';
import { AuthGuard } from './shared/auth.guard';
import { UserComponent } from './user/user.component';
import { WindowService } from './shared/window.service';
import { PhoneLoginComponent } from './login/phone-login.component';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { NotificationsComponent } from './notifications/notifications.component';
import { MaterialModule } from './material.module';

@NgModule({
  imports: [
    BrowserModule, NoopAnimationsModule, HttpClientModule,
    FormsModule, ReactiveFormsModule, AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule, AngularFireAuthModule, AngularFireMessagingModule,
    MaterialModule,
    RoundProgressModule,
    MomentModule,
  ],
  declarations: [
    AppComponent, LoginComponent, PhoneLoginComponent,
    InputComponent, TimerComponent,
    InfoDialog, UserComponent, NotificationsComponent
  ],
  providers: [AuthService, UserService, AuthGuard, WindowService],
  entryComponents: [
    InfoDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
