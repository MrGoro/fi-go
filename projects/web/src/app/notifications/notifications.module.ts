import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationUiComponent } from './notification-ui/notification-ui.component';
import { MaterialModule } from '../shared/material.module';

@NgModule({
  declarations: [
    NotificationUiComponent
  ],
  exports: [
    NotificationUiComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class NotificationsModule { }
