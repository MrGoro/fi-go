import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import {NotificationTool, NotificationTrigger} from "./notification-tool";
import {FcmMessenger} from "./fcm-messenger";

admin.initializeApp();

const messenger: FcmMessenger = new FcmMessenger();
const notify: NotificationTool = new NotificationTool(messenger);

export const timeTrigger = functions.https.onRequest((req, res) => {
  // Executed every minute by https://cron-job.org/de/members/jobs/details/?jobid=2563149
  console.log("Executing TimeTrigger at " + new Date());

  return notify.trigger().then((uids) => {
    const resultText: string = "Executing TimeTrigger finished at " + new Date() +
      ' with notifications to ' + uids.join(', ');
    res.send(resultText);
    return resultText;
  });
});

export const modifyTime = functions.firestore
  .document('data/{userID}')
  .onWrite((change, context) => {
    const uid = context.params.userID;
    //const oldDocument = change.before.data();

    if(change.after.exists &&
        change.after.data()['startTime'] &&
        change.after.data()['notifications']===true) {

      // Set Notification Trigger for user
      const document = change.after.data();
      const startTime: Date = new Date(document['startTime']);
      console.log('Start-Time: ' + startTime + ' | UID: ' + uid);
      const trigger : NotificationTrigger = {
        startTime: startTime,
        uid: uid,
        endNotificationSent: false,
        warningNotificationSent: false
      };
      return admin.firestore().doc(`notifications/${uid}`).set(trigger)
        .then(() => console.log('Notification created: '+uid))
        .catch(err => handle(err));
    } else {
      // Remove Notification Triggers for user
      return admin.firestore().doc(`notifications/${uid}`).delete()
        .then(() => console.log('Notification deleted: '+uid))
        .catch(err => handle(err));
    }
  });

function handle(error) {
  console.log(error);
}

