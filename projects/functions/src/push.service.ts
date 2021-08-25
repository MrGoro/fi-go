import { sendNotification, setVapidDetails } from 'web-push';
import { Notification } from './notification';

const vapidKeys = {
  "publicKey":"BBlR5PyYBWA1wGjHFNthwRvWKdMXPJZurrTlnZw8EedEEiCcFXhxw72jzi-VU0dPp0Ur3A4CJvAaxTCDiMhq7v4",
  "privateKey":"hXntozMd8dnrLfFQXtZp4b-rhrVPN7EZSWY0IvmJBxI"
};

export async function pushNotification(notification: Notification): Promise<boolean> {
  setVapidDetails(
    'mailto:mail@philipp-schuermann.de',
    vapidKeys.publicKey,
    vapidKeys.privateKey
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

  const result = await sendNotification(notification.pushToken, JSON.stringify(notificationPayload));

  return result.statusCode == 200;
}
