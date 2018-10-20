import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {MatButtonModule, MatInputModule} from '@angular/material';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatDialogModule} from '@angular/material/dialog';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatMenuModule} from '@angular/material/menu';
import {MomentModule} from 'ngx-moment';
import {RoundProgressModule} from 'angular-svg-round-progressbar';

import {AppComponent} from './app.component';
import {AppRoutingModule} from './app-routing.module';

import { LoginComponent } from './login/login.component';
import {InputComponent} from './input/input.component';
import {TimerComponent} from './timer/timer.component';
import {InfoDialog} from './shared/info-dialog';

import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { environment } from '../environments/environment';

import * as moment from 'moment';
import { AuthService } from './shared/auth.service';
import { UserService } from './shared/user.service';
import { AuthGuard } from './shared/auth.guard';
import { UserComponent } from './user/user.component';

@NgModule({
  imports: [
    BrowserModule, NoopAnimationsModule, HttpClientModule,
    FormsModule, ReactiveFormsModule, AppRoutingModule,
    MatButtonModule, MatInputModule, MatToolbarModule, MatIconModule,
    MatDialogModule, MatCardModule, MatMenuModule,
    RoundProgressModule,
    MomentModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFirestoreModule,
    AngularFireAuthModule
  ],
  declarations: [
    AppComponent, LoginComponent, InputComponent, TimerComponent, InfoDialog, UserComponent
  ],
  providers: [AuthService, UserService, AuthGuard],
  entryComponents: [
    InfoDialog
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
