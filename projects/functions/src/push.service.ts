import * as webPush from 'web-push'
import { Notification } from './notification';
import { config } from 'firebase-functions';

export async function pushNotification(notification: Notification): Promise<boolean> {

  webPush.setVapidDetails(
    'mailto:spam@mrgoro.de',
    config().vapid.keys.public,
    config().vapid.keys.private
  );

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

  const result = await webPush.sendNotification(notification.pushToken, JSON.stringify(notificationPayload));

  return result.statusCode == 200;
}
