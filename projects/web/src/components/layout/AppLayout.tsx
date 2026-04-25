import { useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AppBar } from './AppBar';
import { AboutDialog } from './AboutDialog';
import { PushNotificationButton } from './PushNotificationButton';

interface AppLayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
  /**
   * Minimal-Variante für Zwischen-Screens (z.B. Clock-In): kein Desktop-Actions-Slot,
   * kein Push-Notification-Button, keine max-w-Mitte, kein BottomBar.
   */
  minimal?: boolean;
  /** Mobile: fixed bottom bar (action buttons while timer runs). Ignoriert bei `minimal`. */
  bottomBar?: ReactNode;
  /** Desktop: shown in AppBar between logo and profile menu. Ignoriert bei `minimal`. */
  desktopActions?: ReactNode;
}

export function AppLayout({
  children,
  user,
  onLogout,
  minimal = false,
  bottomBar,
  desktopActions,
}: AppLayoutProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div
      className={
        minimal
          ? 'min-h-svh flex flex-col'
          : 'min-h-svh flex flex-col text-foreground animate-in fade-in duration-300'
      }
    >
      <AppBar
        user={user}
        onLogout={onLogout}
        onOpenAbout={() => setIsAboutOpen(true)}
        desktopActions={minimal ? undefined : desktopActions}
        extra={minimal ? undefined : <PushNotificationButton userId={user.uid} />}
      />

      {minimal ? (
        <div className="flex-1 flex flex-col">{children}</div>
      ) : (
        <div className="flex-1 flex max-w-5xl mx-auto w-full sm:px-8 py-6 pb-32 sm:pb-6 overflow-x-hidden">
          <main className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px]">
            {children}
          </main>
        </div>
      )}

      {/* Bottom nav (mobile only, full layout only) */}
      {!minimal && bottomBar && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-40 sm:hidden">
          <div className="max-w-md mx-auto">
            {bottomBar}
          </div>
        </div>
      )}

      <AboutDialog open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </div>
  );
}
