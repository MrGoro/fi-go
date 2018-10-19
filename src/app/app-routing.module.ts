import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { InputComponent } from './input/input.component';
import { TimerComponent } from './timer/timer.component';

const appRoutes: Routes = [
  { path: 'input', component: InputComponent },
  { path: 'timer', component: TimerComponent },
  { path: '', redirectTo: '/input', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // <-- debugging purposes only
    )
  ],
  exports: [
    RouterModule
  ]
})
export class AppRoutingModule { }
