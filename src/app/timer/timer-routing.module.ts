import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { canActivateWithData, canActivateWithoutData } from './data.guard';
import { DisplayComponent } from './display/display.component';
import { InputComponent } from './input/input.component';

const routes: Routes = [
    { path: 'input', component: InputComponent, ...canActivateWithoutData('startTime', 'timer/display') },
    { path: 'display', component: DisplayComponent, ...canActivateWithData('startTime', 'timer/input') },
    { path: '',   redirectTo: 'display', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TimerRoutingModule { }
