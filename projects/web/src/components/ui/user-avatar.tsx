import type { User } from 'firebase/auth';
import { User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Size = 'sm' | 'md' | 'lg';

const SIZE_CLASS: Record<Size, string> = {
  sm: 'w-8 h-8',
  md: 'w-9 h-9',
  lg: 'w-10 h-10',
};

interface UserAvatarProps {
  user: Pick<User, 'email' | 'photoURL'> | null;
  size?: Size;
  className?: string;
}

/**
 * Rundes User-Emblem: Foto → Initiale → Icon-Fallback.
 * Einheitlicher Rahmen/Background, früher in ProfileMenu zweimal inline kopiert.
 */
export function UserAvatar({ user, size = 'sm', className }: UserAvatarProps) {
  const initial = user?.email?.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold',
        'shadow-sm border border-primary/20',
        SIZE_CLASS[size],
        className,
      )}
    >
      {user?.photoURL ? (
        <img src={user.photoURL} alt="" className="w-full h-full rounded-full object-cover" />
      ) : initial ? (
        <span>{initial}</span>
      ) : (
        <UserIcon className="h-1/2 w-1/2 opacity-70" />
      )}
    </div>
  );
}
