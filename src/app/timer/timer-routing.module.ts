import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DisplayComponent } from './display/display.component';
import { InputComponent } from './input/input.component';

const routes: Routes = [
    { path: 'input', component: InputComponent},
    { path: 'display', component: DisplayComponent},
    { path: '',   redirectTo: '/display', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimerRoutingModule { }
