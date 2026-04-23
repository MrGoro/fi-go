import { useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AppBar } from './AppBar';
import { AboutDialog } from './AboutDialog';
import { PushNotificationButton } from './PushNotificationButton';

interface AppLayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
  /** Mobile: fixed bottom bar (action buttons while timer runs) */
  bottomBar?: ReactNode;
  /** Desktop: shown in AppBar between logo and profile menu */
  desktopActions?: ReactNode;
}

export default function AppLayout({
  children,
  user,
  onLogout,
  bottomBar,
  desktopActions,
}: AppLayoutProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-svh flex flex-col text-foreground animate-in fade-in duration-300">
      <AppBar
        user={user}
        onLogout={onLogout}
        onOpenAbout={() => setIsAboutOpen(true)}
        desktopActions={desktopActions}
        extra={<PushNotificationButton userId={user.uid} />}
      />

      <div className="flex-1 flex max-w-5xl mx-auto w-full sm:px-8 py-6 pb-32 sm:pb-6 overflow-x-hidden">
        <main className="flex-1 flex flex-col items-center justify-center w-full min-h-[500px]">
          {children}
        </main>
      </div>

      {/* ── Bottom nav (mobile only) ───────────────────────────────── */}
      {bottomBar && (
        <div className="fixed bottom-0 inset-x-0 p-4 z-40 sm:hidden">
          <div className="max-w-md mx-auto">
            {bottomBar}
          </div>
        </div>
      )}

      <AboutDialog isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </div>
  );
}
