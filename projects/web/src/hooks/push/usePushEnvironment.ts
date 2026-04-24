import { useState } from 'react';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

function detectIos(): boolean {
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    // iPadOS 13+ meldet Desktop-UA, hat aber Touch-Events
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function detectStandalone(): boolean {
  return (
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true) ||
    window.matchMedia('(display-mode: standalone)').matches
  );
}

export interface PushEnvironment {
  permission: PushPermission;
  setPermission: (p: PushPermission) => void;
  /** `true` wenn iOS Safari aber NICHT als PWA installiert (Push unmöglich). */
  isIosInstallRequired: boolean;
  /** `true` wenn der Browser Web-Push fundamental nicht unterstützt. */
  isUnsupported: boolean;
}

/**
 * Ermittelt die Laufzeit-Umgebung für Web-Push: Notification-Permission,
 * iOS-Installations-Pflicht, grundsätzliche Unterstützung. Frei von Firebase-
 * und Userdaten-Abhängigkeiten.
 */
export function usePushEnvironment(): PushEnvironment {
  const [permission, setPermission] = useState<PushPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const isIos = detectIos();
  const isStandalone = detectStandalone();
  // Auf iOS funktioniert Push ausschließlich als installierte PWA
  const isIosInstallRequired = isIos && !isStandalone;

  const isUnsupported =
    typeof Notification === 'undefined' ||
    !('serviceWorker' in navigator) ||
    !('PushManager' in window);

  return { permission, setPermission, isIosInstallRequired, isUnsupported };
}
