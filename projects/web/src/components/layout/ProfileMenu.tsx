import type { User } from 'firebase/auth';
import { LogOut, ChevronDown, Github, Bug, Info, User as UserIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

interface ProfileMenuProps {
  user: User;
  onLogout?: () => void;
  onOpenAbout: () => void;
}

export function ProfileMenu({ user, onLogout, onOpenAbout }: ProfileMenuProps) {
  const userInitial = user.email?.charAt(0).toUpperCase();

  const renderAvatar = (sizeClass = "w-8 h-8") => (
    <div className={`${sizeClass} rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold shadow-sm border border-primary/20`}>
      {user.photoURL ? (
        <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
      ) : userInitial ? (
        <span>{userInitial}</span>
      ) : (
        <UserIcon className="h-1/2 w-1/2 opacity-70" />
      )}
    </div>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        className="flex items-center gap-1.5 p-1 px-1.5 rounded-full hover:bg-accent transition-all duration-200 outline-none group cursor-pointer"
      >
        {renderAvatar()}
        <ChevronDown className="h-3.5 w-3.5 text-muted-foreground/60 transition-transform duration-300 group-data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl p-2 z-50">
        <div className="flex flex-col gap-1 p-3">
          {/* Profile Header */}
          <div className="flex items-center gap-3 px-1 mb-2">
            {renderAvatar("w-10 h-10")}
            <div className="flex flex-col min-w-0">
              <p className="text-[10px] font-bold text-muted-foreground/50 uppercase tracking-widest">Eingeloggt als</p>
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
              onClick={() => window.open("https://github.com/MrGoro/fi-go", "_blank")}
              className="flex items-center gap-3 px-3 py-2.5 text-sm text-muted-foreground focus:text-foreground focus:bg-accent/50 rounded-xl transition-colors cursor-pointer"
            >
              <Github className="h-4 w-4 shrink-0" />
              <span className="font-medium">Quellcode auf GitHub</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => window.open("https://github.com/MrGoro/fi-go/issues/new", "_blank")}
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
