import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
//import { redirectLoggedInTo, canActivate } from '@angular/fire/compat/auth-guard';

//const redirectLoggedInToTimer = () => redirectLoggedInTo(['timer']);

const routes: Routes = [
    { path: 'login', component: LoginComponent, /**...canActivate(redirectLoggedInToTimer) */},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
