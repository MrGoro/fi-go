import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthorizedGuard } from './auth/util/authorized.guard';

const routes: Routes = [
  {
    path: 'timer',
    canLoad: [AuthorizedGuard],
    loadChildren: () => import('./timer/timer.module').then(m => m.TimerModule)
  }, {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  }, {
    path: '',
    redirectTo: 'timer',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
