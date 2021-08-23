import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './auth/auth.module';
import { TimerModule } from './timer/timer.module';
import { environment } from 'src/environments/environment';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { getDatabase, provideDatabase } from '@angular/fire/database';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule,
    AuthModule,
    TimerModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
