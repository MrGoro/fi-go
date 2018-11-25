import * as admin from 'firebase-admin';
import * as firestore from "@google-cloud/firestore";
import {FcmMessageContent, FcmMessenger} from "./fcm-messenger";

export class NotificationTool {

  constructor(private messenger: FcmMessenger) {}

  public trigger(): Promise<string[]> {
    return this.getNotifications().then(notifications => {
      const notifiedUids : Promise<string>[] = [];
      notifications.forEach(notification => {
        const data = notification.data();
        console.log('Notification: ' + JSON.stringify(data));

        if(NotificationTool.isTimeOver(data)) {
          const uidPromise: Promise<string> = this.sendTimeOverNotification(data['uid']);
          notification.ref.update({endNotificationSent: true}).then(()=>console.log("Checked End")).catch(console.log);
          notifiedUids.push(uidPromise);
        }

        if(NotificationTool.isWarningOver(data)) {
          const uidPromise: Promise<string> = this.sendWarningNotification(data['uid']);
          notification.ref.update({warningNotificationSent: true}).then(()=>console.log("Checked Warning")).catch(console.log);
          notifiedUids.push(uidPromise);
        }
      });
      return Promise.all(notifiedUids);
    });
  }

  private getNotifications(): Promise<firestore.QueryDocumentSnapshot[]> {
    return admin.firestore().collection(`notifications`).get().then(querySnapshot => {
      return querySnapshot.docs;
    });
  }

  static isTimeOver(data: any):boolean {
    const endNotificationSent: boolean = data['endNotificationSent'];
    const startTime: Date = new Date(data['startTime']);
    const workTime = (7*60+48+30)*60*1000; // 7 Stunden, 48 Minuten (30 Minuten Pause)
    const difference: number = (new Date().getTime()-startTime.getTime())-workTime;
    const over:boolean = difference > 0;
    console.log(`Now: ${new Date().getTime()} Start-Time: ${startTime.getTime()} Work-Time: ${workTime} Difference: ${difference} Over? ${over}`);
    return over && !endNotificationSent;
  }

  static isWarningOver(data: any):boolean {
    const warningNotificationSent: boolean = data['warningNotificationSent'];
    const startTime: Date = new Date(data['startTime']);
    const warningTime = 10*60*60*1000; // Break = Warning Time (30 minutes earlier)
    const difference: number = (new Date().getTime()-startTime.getTime())-warningTime;
    const over:boolean = difference > 0;
    console.log(`Now: ${new Date().getTime()} Start-Time: ${startTime.getTime()} Warning-Time: ${warningTime} Difference: ${difference} Over? ${over}`);
    return over && !warningNotificationSent;
  }

  private sendTimeOverNotification(uid: string): Promise<string> {
    console.log('Time Over Notification to ' + uid);
    const message: FcmMessageContent = {
      title: 'Arbeitszeit geschafft',
      body: 'Du hast deine Soll-Arbeitszeit von 8:48 Stunden erreicht. Zeit nach Hause zu gehen!',
      icon: '/assets/icons/android-chrome-192x192.png'
    };
    return this.messenger.sendMessage(message, uid).then(deviceIds => {
      return uid + '[' + deviceIds.length + ']';
    });
  }

  private sendWarningNotification(uid: string): Promise<string> {
    console.log('Warning Notification to ' + uid);
    const message: FcmMessageContent = {
      title: 'Achtung: Arbeitszeitverstoß droht!',
      body: 'Du warst bereits 9:30 Stunden bei der Arbeit. In spätestens 30 Minuten musst du gehen!',
      icon: '/assets/icons/android-chrome-192x192.png'
    };
    return this.messenger.sendMessage(message, uid).then(deviceIds => {
      return uid + '[' + deviceIds.length + ']';
    });
  }
}

export interface NotificationTrigger {
  startTime: Date,
  uid: string,
  endNotificationSent: boolean,
  warningNotificationSent: boolean
}
