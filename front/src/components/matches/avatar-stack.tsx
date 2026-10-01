import Link from 'next/link';

import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/match';

const AVATAR_SIZE = 64;
const OVERLAP = 16;
const STEP = AVATAR_SIZE - OVERLAP;

type AvatarStackProps = {
  users: PublicUser[];
  max?: number;
};

export function AvatarStack({ users, max = 6 }: AvatarStackProps) {
  const shown = users.slice(0, max);
  const overflow = users.length - shown.length;
  const slots = shown.length + (overflow > 0 ? 1 : 0);

  return (
    <span
      className="relative block"
      style={{ height: AVATAR_SIZE, width: (slots - 1) * STEP + AVATAR_SIZE }}
    >
      {shown.map((user, position) => (
        <Link
          key={user.id}
          href={`/usuarios/${user.id}`}
          aria-label={`Ver perfil de ${user.name}`}
          className="absolute top-0 rounded-full ring-2 ring-base focus-visible:ring-brand focus-visible:outline-none"
          style={{ left: position * STEP }}
        >
          <UserAvatar
            name={user.name}
            photoUrl={user.photoUrl}
            sizes="64px"
            className="size-16"
            initialsClassName="text-callout"
          />
        </Link>
      ))}

      {overflow > 0 && (
        <span
          className="absolute top-0 flex size-16 items-center justify-center rounded-full bg-glass-strong text-callout font-bold text-ink-64 ring-2 ring-base"
          style={{ left: shown.length * STEP }}
        >
          +{overflow}
        </span>
      )}
    </span>
  );
}
