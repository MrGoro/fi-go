import { useState, useEffect, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { ref, set, onValue } from 'firebase/database';
import { db, messagingPromise } from '../config/firebase';
import { useToast } from './use-toast';

// IMPORTANT: Replace this with your actual VAPID key from Firebase Console:
// Firebase Console -> Project Settings -> Cloud Messaging -> Web Push certificates -> Key pair
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

export type NotificationPermission = 'default' | 'granted' | 'denied' | 'unsupported';

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

function detectIos(): boolean {
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    // iPadOS 13+ has desktop UA but touch events
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectStandalone(): boolean {
  return (
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export function usePushNotifications(userId: string | null): PushNotificationState {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isOptedIn, setIsOptedIn] = useState(false);

  const isIos = detectIos();
  const isStandalone = detectStandalone();
  // On iOS, push only works when installed as PWA
  const isIosInstallRequired = isIos && !isStandalone;

  const isUnsupported =
    typeof Notification === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window);

  // Helper to make tokens safe for DB keys
  const sanitizeToken = (token: string) => token.replace(/[.#$[\]/]/g, '_');

  // Save FCM token to Firebase DB for the current user
  const saveFcmToken = useCallback(
    async (token: string) => {
      if (!userId) return;
      try {
        const localKey = `fcmToken_${userId}`;
        const previousToken = localStorage.getItem(localKey);

        // Token has rotated (SW update, re-install) — remove the old DB entry so
        // the backend never sends to both the old and new token for the same device.
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

        // Only persist locally after the DB write succeeds, so a failed save
        // doesn't silently suppress the old-token cleanup on the next attempt.
        localStorage.setItem(localKey, token);
      } catch (error) {
        console.error('[PushNotifications] Failed to save FCM token:', error);
      }
    },
    [userId]
  );

  // Deactivate notifications by removing token from DB
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

  // Request permission and obtain FCM token
  const requestPermission = useCallback(async () => {
    if (!userId || isUnsupported || isIosInstallRequired) return;

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

        // Add a safety timeout for SW registration
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
    } catch (err: any) {
      console.error('[PushNotifications] Error requesting permission:', err);
      if (err.message?.includes('applicationServerKey')) {
        toast({
          title: 'Ungültiger Push-Key',
          description: 'Der VAPID-Key ist ungültig. Bitte prüfe die .env Datei.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [userId, isUnsupported, isIosInstallRequired, saveFcmToken, toast]);

  // Handle foreground messages (app is open)
  useEffect(() => {
    if (isUnsupported || isIosInstallRequired) return;

    let unsubscribe: (() => void) | undefined;
    messagingPromise.then((messaging) => {
      if (!messaging) return;
      unsubscribe = onMessage(messaging, (payload) => {
        console.debug('[PushNotifications] Foreground message:', payload);
        // For foreground messages, we show our own in-app notification.
        // The browser won't auto-show it, so we trigger the notification API manually.
        if (Notification.permission === 'granted' && payload.notification) {
          new Notification(payload.notification.title || 'fi-go', {
            body: payload.notification.body,
            icon: '/icon-192x192.png',
          });
        }
      });
    });

    return () => unsubscribe?.();
  }, [isUnsupported, isIosInstallRequired]);

  // Refresh token on mount if permission is already granted and sync status
  useEffect(() => {
    if (!userId || isUnsupported || isIosInstallRequired) return;

    // Sync opt-in status from DB (check if current device is registered)
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
          // Refresh lastSeen in DB while we already have the token
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
  }, [userId, permission, isUnsupported, isIosInstallRequired, saveFcmToken]);

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
