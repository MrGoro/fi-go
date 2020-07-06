import { Component, OnInit } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { mergeMap, mergeMapTo, tap } from 'rxjs/operators';
import { StorageService } from '../shared/storage.service';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';

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
              private afStore: AngularFirestore,
              private storage: StorageService) {
  }

  ngOnInit() {
    //this.supported = firebase.messaging.isSupported();
    this.supported = true;
    this.storage.get('notifications').subscribe(notificationsEnabled => {
      if (notificationsEnabled || notificationsEnabled == undefined) {
        console.log('Notifications enabled!');
        this.afMessaging.getToken
          .pipe(mergeMapTo(this.afMessaging.tokenChanges))
          .subscribe(
            (token) => {
              this.sendTokenToServer(token);
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
    this.afMessaging.requestToken
      .subscribe(
        (token) => {
          console.log('Permission granted! Save to the server!', token);
          this.sendTokenToServer(token);
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
      .pipe(
        tap(token => this.deleteTokenFromServer(token)),
        mergeMap(token => this.afMessaging.deleteToken(token)))
      .subscribe(
        (success) => {
          this.setNotifications(false);
        },
      );
  }

  setNotifications(state: boolean) {
    if (state) {
      this.status = Status.On;
    } else {
      this.status = Status.Off;
    }
    this.storage.set('notifications', state).subscribe(() => 'Saved Notifications ' + state ? 'enabled' : 'disabled');
  }

  sendTokenToServer(token: string) {
    console.log('Sending FCM-Token to server: ' + token);

    this.storage.getRef().subscribe(ref => {
      const fcmTokenCollection: AngularFirestoreCollection<FcmToken> = ref.collection<FcmToken>('fcmToken');
      fcmTokenCollection.add({token: token}).then(() => console.log('Token saved successfully.'));
    });
  }

  deleteTokenFromServer(token: string) {
    console.log('Deleting FCM-Token from server: ' + token);

    this.storage.getRef().subscribe(ref => {
      const fcmTokenCollection: AngularFirestoreCollection<FcmToken> = ref.collection<FcmToken>('fcmToken',
        ref => ref.where('token', '==', token));
      fcmTokenCollection.get().forEach(querySnapshot => {
        querySnapshot.forEach((doc) => {
          doc.ref.delete().then(() => {
            console.log('Token successfully deleted!');
          }).catch(function (error) {
            console.error('Error removing token: ', error);
          });
        });
      })
    });
  }

}

export interface FcmToken {
  token: string
}

export enum Status {
  Off, On, Denied
}
