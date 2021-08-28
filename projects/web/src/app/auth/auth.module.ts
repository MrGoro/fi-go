import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { UserComponent } from './user/user.component';
import { AuthRoutingModule } from './auth-routing.module';
import { MaterialModule } from '../shared/material.module';

@NgModule({
  declarations: [
    LoginComponent,
    UserComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    AuthRoutingModule
  ],
  exports: [
    UserComponent
  ]
})
export class AuthModule { }
