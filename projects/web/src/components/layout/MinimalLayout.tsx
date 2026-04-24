import { useState, type ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { AppBar } from './AppBar';
import { AboutDialog } from './AboutDialog';

interface MinimalLayoutProps {
  children: ReactNode;
  user: User;
  onLogout: () => void;
}

export function MinimalLayout({ children, user, onLogout }: MinimalLayoutProps) {
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <div className="min-h-svh flex flex-col">
      <AppBar
        user={user}
        onLogout={onLogout}
        onOpenAbout={() => setIsAboutOpen(true)}
      />

      <div className="flex-1 flex flex-col">
        {children}
      </div>

      <AboutDialog open={isAboutOpen} onOpenChange={setIsAboutOpen} />
    </div>
  );
}
