import * as functions from "firebase-functions";
import * as admin from 'firebase-admin';
import { isAfter, sub, Duration, add, isBefore } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import de from "date-fns/locale/de"
import { Notification } from './notification';
import { PushSubscription } from 'web-push';
import { pushNotification } from './push.service';

const app = admin.initializeApp();
const db = app.database();

const timeZone = 'Europe/Berlin'
const timeToWork: Duration = {hours: 7, minutes: 48};
const pause: Duration = {minutes: 30};
const tenHours: Duration = {hours: 10, minutes: 30};

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

async function scheduleNotifications(userId: string, startTime: Date) {
  functions.logger.debug('Scheduling Notifications: ', userId, startTime);

  const options = { locale: de, timeZone: timeZone };

  const pushToken = await getPushToken(userId);
  if(pushToken) {

    // Finish Time Notification
    const finishTime = add(add(startTime, timeToWork), pause);
    const zonedFinishTime = utcToZonedTime(finishTime, timeZone);
    const finishTimeFormatted = format(zonedFinishTime, 'HH:mm', options);
    await saveNotification({
      title: 'Feierabend!',
      body: `Deine Arbeitszeit endet um ${finishTimeFormatted} Uhr!`,
      time: finishTime.getTime(),
      userId: userId,
      pushToken: pushToken
    });

    // Ten Hours Notification
    const tenHoursTime = add(startTime, tenHours);
    const zonedTenHoursTime = utcToZonedTime(tenHoursTime, timeZone);
    const tenHoursTimeFormatted = format(zonedTenHoursTime, 'HH:mm', options);
    await saveNotification({
      title: '10 Stunden!',
      body: `Deine 10-Stunden-Grenze wird um ${tenHoursTimeFormatted} Uhr erreicht!`,
      time: tenHoursTime.getTime(),
      userId: userId,
      pushToken: pushToken
    });

  } else {
    functions.logger.info('No Push-Token found for user; skipping scheduled Notifications.', userId, startTime);
  }
}

async function saveNotification(notification: Notification): Promise<void> {
  if(isAfter(notification.time, new Date())) {
    const ref = db.ref('notifications');
    await ref.push().set(notification);
    functions.logger.info('Saved Notification: ', notification);
  } else {
    functions.logger.info('Skipping schedule of notification as it is in the past.', notification);
  }
}

function getPushToken(userId: string): Promise<PushSubscription | null> {
  const ref = db.ref(`users/${userId}`);

  return new Promise<PushSubscription | null>((resolve, reject) =>
    ref.on('value', (snapshot) => {
      const user = snapshot.val();
      if(user && user.pushToken && typeof user.pushToken !== 'undefined') {
        resolve(user.pushToken);
      } else {
        resolve(null);
      }
    }, (errorObject) => {
      functions.logger.error('Read of Push-Token failed: ' + errorObject.name, userId);
      reject("Error reading Push-Token: " + errorObject.name);
    })
  );
}

async function deleteAllNotifications(userId: string) {
  functions.logger.info('Deleting all Notifications for User', userId);

  const notifications = await getNotifications();
  notifications.filter(notification => notification.userId === userId)
    .forEach(removeNotification);
}

export const sendScheduledNotifications = functions.pubsub.schedule('every 5 minutes').onRun(async (context) => {
  console.debug('This will be run every 5 minutes!');

  const notifications: Notification[] = await getNotifications()
  functions.logger.info(`Found ${notifications.length} total.`);

  const filterDate = sub(new Date(), {minutes: 10});
  const notificationsToSend = notifications
    .filter(notification => isAfter(notification.time, filterDate) && isBefore(notification.time, new Date()));
  functions.logger.info(`Found ${notificationsToSend.length} to send till ${format(filterDate, 'HH:mm')}.`,
    filterDate, notificationsToSend);

  await notificationsToSend.forEach(notification => {
    pushNotification(notification);
    removeNotification(notification);
  });

  const oldNotifications = notifications
    .filter(notification => isBefore(notification.time, new Date()));
  functions.logger.info(`Found ${oldNotifications.length} old notifications to delete.`, oldNotifications);
  await oldNotifications.forEach(removeNotification);

  return null;
});

function getNotifications(): Promise<Notification[]> {
  const ref = db.ref('notifications');
  return new Promise<Notification[]>((resolve) =>
    ref.orderByKey().on('value', (snapshot) => {
      const notifications: Notification[] = [];
      snapshot.forEach((data) => {
        const notification: Notification = data.val();
        if(notification && data.key) {
          notification.id = data.key;
          notifications.push(notification);
        }
      });
      resolve(notifications);
  }));
}

async function removeNotification(notification: Notification) {
  if(notification.id) {
    const ref = db.ref('notifications/'+notification.id);
    await ref.remove();
    functions.logger.info('Notification removed: ', notification);
  } else {
    functions.logger.warn('Notification without id could not be removed: ', notification);
  }
}
