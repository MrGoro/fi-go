import { sendNotification, setVapidDetails } from 'web-push';
import { Notification } from './notification';
import { config } from 'firebase-functions';
import * as functions from 'firebase-functions';

export async function pushNotification(notification: Notification): Promise<boolean> {

  setVapidDetails(
    'mailto:spam@mrgoro.de',
    config().vapid.keys.public,
    config().vapid.keys.private
  );

  functions.logger.debug('VAPID Public Key: ', config().vapid.keys.public);

  const notificationPayload = {
    "notification": {
      "title": notification.title,
      "body": notification.body,
      "icon": "assets/icons/apple-touch-icon.png",
      "actions": [{
        "action": "explore",
        "title": "Anzeigen"
      }]
    }
  };

  const result = await sendNotification(notification.pushToken, JSON.stringify(notificationPayload));

  return result.statusCode == 200;
}
