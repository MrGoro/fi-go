import {Component, OnInit} from '@angular/core';
import {AngularFireMessaging} from "@angular/fire/messaging";
import {mergeMap, mergeMapTo} from "rxjs/operators";
import {StorageService} from "../shared/storage.service";

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.css']
})
export class NotificationsComponent implements OnInit {

  public Status = Status;
  public status: Status = Status.Off;
  public supported: boolean = false;

  constructor(private afMessaging: AngularFireMessaging,
              private storage: StorageService) {
  }

  ngOnInit() {
    //this.supported = firebase.messaging.isSupported();
    this.supported = true;

    this.storage.get('notifications').subscribe(notificationsEnabled => {
      if(notificationsEnabled || notificationsEnabled == undefined) {
        console.log('Notifications enabled!');
        this.afMessaging.getToken
          .pipe(mergeMapTo(this.afMessaging.tokenChanges))
          .subscribe(
            (token) => {
              this.setNotifications(true);
            },
            (error) => {
              this.status = Status.Denied;
            }
          );
      } else {
        console.log('Notifications disabled!');
      }
    });
  }

  requestPermission() {
    this.afMessaging.requestPermission
      .pipe(mergeMapTo(this.afMessaging.tokenChanges))
      .subscribe(
        (token) => {
          console.log('Permission granted! Save to the server!', token);
          this.setNotifications(true);
        },
        (error) => {
          console.error(error);
          if (error.code === 'messaging/unsupported-browser') {

          } else if (error.code) {

          }
          this.status = Status.Denied;
        },
      );
  }

  deleteToken() {
    this.afMessaging.getToken
      .pipe(mergeMap(token => this.afMessaging.deleteToken(token)))
      .subscribe(
        (token) => {
          console.log('Deleted!');
          this.setNotifications(false);
        },
      );
  }

  setNotifications(state: boolean) {
    if(state) {
      this.status = Status.On;
    } else {
      this.status = Status.Off;
    }
    this.storage.set('notifications', state).subscribe(() => 'Saved Notifications ' + state ? 'enabled' : 'disabled');
  }

}

export enum Status {
  Off, On, Denied
}
