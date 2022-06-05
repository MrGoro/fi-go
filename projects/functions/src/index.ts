import * as functions from "firebase-functions";
import { deleteAllNotifications, scheduleNotifications, sendNotifications } from './notification.service';
import { Break, extractBreaks } from './breaks.service';

export const startTimeChanged = functions.database.ref('/data/{userId}')
  .onWrite(async (change, context) => {
    const userId = context.params.userId;
    const after = change.after.val();
    const before = change.before.val();

    functions.logger.debug('Data Changed: ', userId, before, after);

    await deleteAllNotifications(userId);

    if(after !== null) {
      const startTimeMillis = after.startTime;
      if (!isNaN(startTimeMillis)) {
        const startTime = new Date(startTimeMillis);
        const breaks: Break[] = extractBreaks(change.after);
        await scheduleNotifications(userId, startTime, breaks);
      }
    }

    return change;
  });

export const sendScheduledNotifications = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  await sendNotifications();
  return null;
});
