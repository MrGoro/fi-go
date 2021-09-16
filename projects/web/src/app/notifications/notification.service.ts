import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { LocalStorageService } from '../shared/local-storage.service';
import { UserService } from '../auth/util/user.service';
import { AuthService } from '../auth/util/auth.service';

const keyDisabled = 'notificationsDisabled';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private disabled = false;
  private loggedIn = false;

  constructor(
    private swPush: SwPush,
    private storage: LocalStorageService,
    private userService: UserService,
    public authService: AuthService) {

    this.init();
  }

  get enabled():boolean {
    return this.swPush.isEnabled && 'PushManager' in window;
  }

  public isEnabled(): Observable<boolean> {
    return this.authService.isLoggedIn().pipe(
      map(loggedIn => loggedIn && this.enabled)
    );
  }

  get granted(): boolean {
    return Notification.permission == "granted";
  }

  get denied(): boolean {
    return Notification.permission == "denied";
  }

  get default(): boolean {
    return Notification.permission == "default";
  }

  get subscription(): Observable<PushSubscription | null> {
    return this.authService.isLoggedIn().pipe(
      tap(loggedIn => this.loggedIn = loggedIn),
      filter(loggedIn => loggedIn),
      switchMap(() => {
        return this.swPush.subscription.pipe(
          tap(sub => {
            if(sub === null) {
              if(this.granted && !this.disabled) {
                this.subscribeToNotifications();
              }
            }
            this.subReceived(sub);
          })
        );
      })
    )
  }

  public init(): void {
    this.disabled = this.storage.getBoolean(keyDisabled);
  }

  public disable() {
    this.storage.setBoolean(keyDisabled, true);
    this.disabled = true;
    this.swPush.unsubscribe();
  }

  public enable() {
    this.storage.setBoolean(keyDisabled, false);
    this.disabled = false;
    this.subscribeToNotifications();
  }

  public subscribeToNotifications() {
    this.swPush.requestSubscription({
      serverPublicKey: environment.vapidPublicKey
    })
    .then()
    .catch(err => console.error("Could not subscribe to notifications", err));
  }

  private subReceived(sub: PushSubscription | null) {
    console.log(`Sending Push-Token to Server: ${sub !== null}`);
    this.userService.updateUser('pushToken', sub).subscribe();
  }
}
