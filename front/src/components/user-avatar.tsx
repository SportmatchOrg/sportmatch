import { User } from 'lucide-react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] ?? '')
    .join('')
    .toUpperCase();
}

type UserAvatarProps = {
  name: string;
  photoUrl: string | null;
  sizes: string;
  className?: string;
  initialsClassName?: string;
};

export function UserAvatar({
  name,
  photoUrl,
  sizes,
  className,
  initialsClassName,
}: UserAvatarProps) {
  const initials = getInitials(name);

  return (
    <span
      className={cn(
        'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-raised',
        className
      )}
    >
      {photoUrl && <Image src={photoUrl} alt="" fill sizes={sizes} className="object-cover" />}

      {!photoUrl && initials && (
        <span className={cn('font-bold text-white/46', initialsClassName)}>{initials}</span>
      )}

      {!photoUrl && !initials && (
        <User className="size-2/5 text-white/46" aria-hidden="true" />
      )}
      <span className="absolute inset-0 rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]" />
    </span>
  );
}
