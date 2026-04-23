import { type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { Logo } from '../ui/Logo';
import { ProfileMenu } from './ProfileMenu';

interface AppBarProps {
  user: User;
  onLogout: () => void;
  onOpenAbout: () => void;
  /** Shown in the bar on desktop only (e.g. Pausen + Feierabend buttons) */
  desktopActions?: ReactNode;
  /** Always-visible element before the profile menu (e.g. push notification button) */
  extra?: ReactNode;
}

export function AppBar({ user, onLogout, onOpenAbout, desktopActions, extra }: AppBarProps) {
  return (
    <header className="h-14 shrink-0 w-full flex items-center px-4 sm:px-6 bg-white/80 backdrop-blur-xl border-b border-white/70 sticky top-0 z-50 shadow-sm dark:bg-neutral-900/70 dark:border-neutral-800/80">
      <Logo height={22} />

      <div className="flex-1" />

      {desktopActions && (
        <div className="hidden sm:flex items-center gap-3 mr-2">
          {desktopActions}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {extra}
        <ProfileMenu user={user} onLogout={onLogout} onOpenAbout={onOpenAbout} />
      </div>
    </header>
  );
}
