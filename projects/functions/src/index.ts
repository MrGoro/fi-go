import * as functions from "firebase-functions";
import { deleteAllNotifications, scheduleNotifications, sendNotifications } from './notification.service';

export const startTimeChanged = functions.database.ref('/data/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const after = change.after.val();
    const before = change.before.val();

    functions.logger.debug('Data Changed: ', userId, before, after);

    if(after === null) {
      await deleteAllNotifications(userId);

    } else if(after && after.startTime) {
      const startTimeMillis = after.startTime;
      if(!isNaN(startTimeMillis)) {
        const startTime = new Date(startTimeMillis);
        await scheduleNotifications(userId, startTime);
      }
    }

    return change;
  });

export const sendScheduledNotifications = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  sendNotifications();
  return null;
});
