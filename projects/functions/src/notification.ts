import { PushSubscription } from 'web-push';

export interface Notification {
  id?: string;
  title: string;
  body: string;
  time: number;
  userId: string;
  pushToken: PushSubscription
}
