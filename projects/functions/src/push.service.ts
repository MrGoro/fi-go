import { sendNotification, setVapidDetails } from 'web-push';
import { Notification } from './notification';
import { config } from 'firebase-functions';

setVapidDetails(
  'mailto:mail@philipp-schuermann.de',
  config().vapid.keys.public,
  config().vapid.keys.private
);

export async function pushNotification(notification: Notification): Promise<boolean> {
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
