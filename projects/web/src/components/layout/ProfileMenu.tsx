import type { User } from 'firebase/auth';
import { LogOut, ChevronDown, ExternalLink, Bug, Info } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UserAvatar } from '@/components/ui/user-avatar';
import { SURFACE_CLASS } from '@/components/ui/surface-classes';
import { Eyebrow } from '@/components/ui/eyebrow';
import { cn } from '@/lib/utils';

interface ProfileMenuProps {
  user: User;
  onLogout?: () => void;
  onOpenAbout: () => void;
}

export function ProfileMenu({ user, onLogout, onOpenAbout }: ProfileMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center gap-1.5 p-1 px-1.5 rounded-full hover:bg-accent transition-all duration-200 outline-none group cursor-pointer"
      >
        <UserAvatar user={user} size="sm" />
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className={cn(SURFACE_CLASS.popover, 'w-64 p-2 z-50')}>
        <div className="flex flex-col gap-1 p-3">
          <div className="flex items-center gap-3 px-1 mb-2">
            <UserAvatar user={user} size="lg" />
            <div className="flex flex-col min-w-0">
              <Eyebrow className="text-muted-foreground/50">Eingeloggt als</Eyebrow>
              <p className="text-sm font-semibold truncate text-foreground/90">
                {user.email || user.phoneNumber || 'Nutzer'}
              </p>
            </div>
          </div>

          <div className="px-1">
            {onLogout && (
              <DropdownMenuItem
                onClick={onLogout}
                className="w-full justify-start text-muted-foreground focus:text-destructive focus:bg-destructive/10 rounded-xl h-10 transition-colors px-2.5 flex items-center gap-3 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="font-medium text-xs">Abmelden</span>
              </DropdownMenuItem>
            )}
          </div>

          <DropdownMenuSeparator className="my-2 opacity-40" />

          <div className="flex flex-col gap-0.5">
            <DropdownMenuItem
              onClick={() => window.open('https://github.com/MrGoro/fi-go', '_blank')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground focus:text-foreground focus:bg-accent/50 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="h-4 w-4 shrink-0" />
              <span className="font-medium">Quellcode auf GitHub</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => window.open('https://github.com/MrGoro/fi-go/issues/new', '_blank')}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground focus:text-foreground focus:bg-accent/50 rounded-xl transition-colors cursor-pointer"
            >
              <Bug className="h-4 w-4 shrink-0" />
              <span className="font-medium">Fehler melden</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={onOpenAbout}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground focus:text-foreground focus:bg-accent/50 rounded-xl transition-colors text-left w-full cursor-pointer"
            >
              <Info className="h-4 w-4 shrink-0" />
              <span className="font-medium">Über fi go!</span>
            </DropdownMenuItem>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
