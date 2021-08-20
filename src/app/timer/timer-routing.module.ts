import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { InputComponent } from './input/input.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth', 'login']);

const routes: Routes = [
    { path: 'input', component: InputComponent, canLoad: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
    { path: 'display', component: DisplayComponent, canLoad: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin }},
    { path: '',   redirectTo: 'display', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimerRoutingModule { }
