import { useCallback, useEffect, useState } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, onValue } from 'firebase/database';
import { db, messagingPromise } from '@/config/firebase';
import { useToast } from '@/hooks/use-toast';
import type { PushPermission } from './usePushEnvironment';

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Firebase-DB-Keys dürfen `.#$[]/` nicht enthalten
const sanitizeToken = (token: string) => token.replace(/[.#$[\]/]/g, '_');

interface UsePushSubscriptionArgs {
  userId: string | null;
  permission: PushPermission;
  setPermission: (p: PushPermission) => void;
  /** Wenn `true`, bleiben alle Operationen no-ops (Umgebung nicht tauglich). */
  disabled: boolean;
}

export interface PushSubscription {
  isLoading: boolean;
  isOptedIn: boolean;
  requestPermission: () => Promise<void>;
  deactivateNotifications: () => Promise<void>;
}

/**
 * Verwaltet die FCM-Token-Subscription pro User: Opt-In-Status aus der DB
 * synchronisieren, neu registrieren, deaktivieren. Lauscht zusätzlich auf
 * Foreground-Messages und zeigt sie via Notification-API lokal an.
 */
export function usePushSubscription({
  userId,
  permission,
  setPermission,
  disabled,
}: UsePushSubscriptionArgs): PushSubscription {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);

  // FCM-Token in Firebase DB speichern, alten Eintrag räumen
  const saveFcmToken = useCallback(
    async (token: string) => {
      if (!userId) return;
      try {
        const localKey = `fcmToken_${userId}`;
        const previousToken = localStorage.getItem(localKey);

        // Token rotiert (SW update, re-install) → alten DB-Eintrag löschen,
        // damit das Backend nicht gleichzeitig an alten und neuen sendet.
        if (previousToken && previousToken !== token) {
          const oldRef = ref(db, `users/${userId}/fcmTokens/${sanitizeToken(previousToken)}`);
          await set(oldRef, null);
        }

        const sanitized = sanitizeToken(token);
        const tokenRef = ref(db, `users/${userId}/fcmTokens/${sanitized}`);
        await set(tokenRef, {
          token,
          lastSeen: Date.now()
        });

        // Lokal erst persistieren NACH erfolgreichem DB-Write — sonst verschluckt
        // ein fehlgeschlagenes Save den Old-Token-Cleanup beim nächsten Versuch.
        localStorage.setItem(localKey, token);
      } catch (error) {
        console.error('[PushNotifications] Failed to save FCM token:', error);
      }
    },
    [userId]
  );

  // Opt-Out: DB-Token löschen
  const deactivateNotifications = useCallback(async () => {
    if (!userId) return;
    try {
      const messaging = await messagingPromise;
      if (!messaging) return;

      const swRegistration = await navigator.serviceWorker.ready;
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration,
      });

      if (currentToken) {
        const sanitized = sanitizeToken(currentToken);
        const tokenRef = ref(db, `users/${userId}/fcmTokens/${sanitized}`);
        await set(tokenRef, null);
      }
    } catch (err) {
      console.error('[PushNotifications] Failed to deactivate:', err);
    }
  }, [userId]);

  // Permission anfragen + Token holen + speichern
  const requestPermission = useCallback(async () => {
    if (!userId || disabled) return;

    setIsLoading(true);
    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === 'granted') {
        const messaging = await messagingPromise;
        if (!messaging) throw new Error('Messaging not initialized');

        if (!VAPID_KEY || VAPID_KEY.length < 50) {
          throw new Error('Ungültiger oder fehlender VAPID-Key in der .env Datei (VITE_FIREBASE_VAPID_KEY).');
        }

        // Safety-Timeout falls die SW-Registrierung hängt
        const swPromise = navigator.serviceWorker.ready;
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Service Worker registration timeout')), 5000)
        );

        const swRegistration = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration;

        const token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration
        });

        if (token) {
          await saveFcmToken(token);
          console.debug('[PushNotifications] FCM token saved:', token.substring(0, 20) + '…');
        }
      }
    } catch (err: unknown) {
      console.error('[PushNotifications] Error requesting permission:', err);
      const message = err instanceof Error ? err.message : '';
      if (message.includes('applicationServerKey')) {
        toast({
          title: 'Ungültiger Push-Key',
          description: 'Der VAPID-Key ist ungültig. Bitte prüfe die .env Datei.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, disabled, setPermission, saveFcmToken, toast]);

  // Foreground-Messages: Browser zeigt sie im Vordergrund nicht automatisch —
  // wir triggern die Notification-API manuell.
  useEffect(() => {
    if (disabled) return;

    let unsubscribe: (() => void) | undefined;
    messagingPromise.then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        console.debug('[PushNotifications] Foreground message:', payload);
        if (Notification.permission === 'granted' && payload.notification) {
          new Notification(payload.notification.title || 'fi-go', {
            body: payload.notification.body,
            icon: '/icon-192x192.png',
          });
        }
      });
    });

    return () => unsubscribe?.();
  }, [disabled]);

  // Opt-In-Status aus DB synchronisieren + Token-lastSeen refreshen
  useEffect(() => {
    if (!userId || disabled) return;

    let unsubscribe: () => void = () => {};

    const syncStatus = async () => {
      try {
        const messaging = await messagingPromise;
        if (!messaging) return;
        const swRegistration = await navigator.serviceWorker.ready;
        const currentToken = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swRegistration,
        });

        if (currentToken) {
          if (permission === 'granted') {
            await saveFcmToken(currentToken);
          }

          const sanitized = sanitizeToken(currentToken);
          const tokenRef = ref(db, `users/${userId}/fcmTokens/${sanitized}`);
          unsubscribe = onValue(
            tokenRef,
            (snapshot) => {
              setIsOptedIn(!!snapshot.val());
            },
            (error) => {
              console.error('[PushNotifications] Token listener error:', error);
            }
          );
        }
      } catch (err) {
        console.error('[PushNotifications] Status sync failed:', err);
      }
    };

    syncStatus();

    return () => unsubscribe();
  }, [userId, permission, disabled, saveFcmToken]);

  return { isLoading, isOptedIn, requestPermission, deactivateNotifications };
}
