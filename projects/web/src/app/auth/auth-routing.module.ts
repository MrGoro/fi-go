import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { UnauthorizedGuard } from './util/unauthorized.guard';

const routes: Routes = [
    { path: 'login', component: LoginComponent, canActivate: [UnauthorizedGuard] },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
