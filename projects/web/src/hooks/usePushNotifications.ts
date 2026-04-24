import { usePushEnvironment, type PushPermission } from './push/usePushEnvironment';
import { usePushSubscription } from './push/usePushSubscription';

export type NotificationPermission = PushPermission;

export interface PushNotificationState {
  permission: NotificationPermission;
  isLoading: boolean;
  /** True if running on iOS Safari but NOT installed as a PWA (push won't work) */
  isIosInstallRequired: boolean;
  /** True if the browser fundamentally does not support push at all */
  isUnsupported: boolean;
  isOptedIn: boolean;
  requestPermission: () => Promise<void>;
  deactivateNotifications: () => Promise<void>;
}

/**
 * Öffentliches Facade-Hook für Web-Push: Umgebungs-Erkennung +
 * Subscription-Management in einem Objekt. Composed aus
 * `usePushEnvironment` (env-only) und `usePushSubscription` (firebase).
 */
export function usePushNotifications(userId: string | null): PushNotificationState {
  const { permission, setPermission, isIosInstallRequired, isUnsupported } = usePushEnvironment();
  const disabled = isUnsupported || isIosInstallRequired;

  const { isLoading, isOptedIn, requestPermission, deactivateNotifications } =
    usePushSubscription({ userId, permission, setPermission, disabled });

  return {
    permission,
    isLoading,
    isIosInstallRequired,
    isUnsupported,
    isOptedIn,
    requestPermission,
    deactivateNotifications,
  };
}
