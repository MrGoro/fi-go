import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InputComponent } from './input/input.component';
import { TimerComponent } from './timer/timer.component';
import { LoginComponent } from './login/login.component';
import { AuthGuard } from './shared/auth.guard';

const appRoutes: Routes = [
  {path: 'login', component: LoginComponent},
  {path: 'input', component: InputComponent, canActivate: [AuthGuard]},
  {path: 'timer', component: TimerComponent, canActivate: [AuthGuard]},
  {path: '', redirectTo: '/input', pathMatch: 'full'},
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false, relativeLinkResolution: 'legacy' } // <-- debugging purposes only
 // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule {
}
