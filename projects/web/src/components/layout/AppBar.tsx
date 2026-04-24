import { type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { Logo } from '../ui/Logo';
import { AppBarShell } from '../ui/app-bar-shell';
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
    <AppBarShell>
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
    </AppBarShell>
  );
}
