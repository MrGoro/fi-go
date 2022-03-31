import * as functions from 'firebase-functions';
import de from 'date-fns/locale/de';
import { add, Duration, isAfter, isBefore, sub } from 'date-fns';
import { format, utcToZonedTime } from 'date-fns-tz';
import { Notification } from './notification';
import { PushSubscription } from 'web-push';
import { pushNotification } from './push.service';
import * as admin from 'firebase-admin';
import { Break, getPause } from './breaks.service';

const app = admin.initializeApp();
const db = app.database();

const timeZone = 'Europe/Berlin'
const timeToWork: Duration = {hours: 7, minutes: 48};
const defaultPause: Duration = {minutes: 30};
const tenHours: Duration = {hours: 10};

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

export async function scheduleNotifications(userId: string, startTime: Date, breaks: Break[] = []) {
  functions.logger.debug('Scheduling Notifications: ', userId, startTime, breaks);

  const options = { locale: de, timeZone: timeZone };

  const pushToken = await getPushToken(userId);
  if(pushToken) {
    // Pause
    const pauseWithBreaks = getPause(breaks, defaultPause);
    functions.logger.debug('Pause: ', pauseWithBreaks);

    // Finish Time Notification
    const finishTime = add(add(startTime, timeToWork), pauseWithBreaks);
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
    const tenHoursTime = add(sub(startTime, pauseWithBreaks), tenHours);
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

export async function saveNotification(notification: Notification): Promise<void> {
  if(isAfter(notification.time, new Date())) {
    const ref = db.ref('notifications');
    await ref.push().set(notification);
    functions.logger.info('Saved Notification: ', notification);
  } else {
    functions.logger.info('Skipping schedule of notification as it is in the past.', notification);
  }
}

export function getNotifications(): Promise<Notification[]> {
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

export async function removeNotification(notification: Notification) {
  if(notification.id) {
    const ref = db.ref('notifications/'+notification.id);
    await ref.remove();
    functions.logger.info('Notification removed: ', notification);
  } else {
    functions.logger.warn('Notification without id could not be removed: ', notification);
  }
}

export async function deleteAllNotifications(userId: string) {
  functions.logger.info('Deleting all Notifications for User', userId);

  const notifications = await getNotifications();
  notifications.filter(notification => notification.userId === userId)
    .forEach(removeNotification);
}

export async function sendNotifications() {
  const notifications: Notification[] = await getNotifications()
  functions.logger.info(`Found ${notifications.length} total.`);

  const filterDate = add(new Date(), {minutes: 10});
  const notificationsToSend = notifications
    .filter(notification => isAfter(notification.time, new Date()) && isBefore(notification.time, filterDate));
  functions.logger.info(`Found ${notificationsToSend.length} to send between ${format(new Date(), 'HH:mm')} & ${format(filterDate, 'HH:mm')}.`,
    filterDate, notificationsToSend);

  await notificationsToSend.forEach(notification => {
    pushNotification(notification);
    removeNotification(notification);
  });

  const oldNotifications = notifications
    .filter(notification => isBefore(notification.time, new Date()));
  functions.logger.info(`Found ${oldNotifications.length} old notifications to delete.`, oldNotifications);
  await oldNotifications.forEach(removeNotification);
}
