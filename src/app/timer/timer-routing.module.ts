import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { InputComponent } from './input/input.component';
//import { canActivate, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard';

//const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['auth', 'login']);

const routes: Routes = [
    { path: 'input', component: InputComponent, /**...canActivate(redirectUnauthorizedToLogin)  */},
    { path: 'display', component: DisplayComponent, /**...canActivate(redirectUnauthorizedToLogin)  */},
    { path: '',   redirectTo: 'display', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimerRoutingModule { }
