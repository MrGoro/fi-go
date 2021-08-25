import { Component, OnDestroy, OnInit } from '@angular/core';
import { NotificationService } from '../notification.service';
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/util/auth.service';

@Component({
  selector: 'app-notification-ui',
  template: `
    <ng-container *ngIf="service.enabled && !service.denied">
      <button mat-icon-button (click)="service.disable()" *ngIf="on"
              aria-label="Push-Benachrichtigungen aktiv">
        <mat-icon>alarm_on</mat-icon>
      </button>
      <button mat-icon-button (click)="service.enable()" *ngIf="!on"
              aria-label="Push-Benachrichtigungen aktivieren">
        <mat-icon>notifications</mat-icon>
      </button>
    </ng-container>
  `,
  styles: [
  ]
})
export class NotificationUiComponent implements OnInit, OnDestroy {

  private sub$!: Subscription;
  public on = false;

  constructor(public service: NotificationService, public authService: AuthService) {}

  ngOnInit(): void {
    this.sub$ = this.service.subscription.subscribe(sub => {
      this.on = sub !== null;
    });
  }

  ngOnDestroy(): void {
    this.sub$.unsubscribe();
  }
}
