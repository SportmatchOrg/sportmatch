import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/partido';

const AVATAR_SIZE = 64;
const OVERLAP = 16;
const STEP = AVATAR_SIZE - OVERLAP;

type AvatarStackProps = {
  usuarios: PublicUser[];
  max?: number;
};

export function AvatarStack({ usuarios, max = 6 }: AvatarStackProps) {
  const shown = usuarios.slice(0, max);
  const overflow = usuarios.length - shown.length;
  const slots = shown.length + (overflow > 0 ? 1 : 0);

  return (
    <span
      className="relative block"
      style={{ height: AVATAR_SIZE, width: (slots - 1) * STEP + AVATAR_SIZE }}
    >
      {shown.map((usuario, position) => (
        <span
          key={usuario.id}
          className="absolute top-0 rounded-full ring-2 ring-base"
          style={{ left: position * STEP }}
        >
          <UserAvatar
            name={usuario.nombre}
            photoUrl={usuario.fotoUrl}
            sizes="64px"
            className="size-16"
            initialsClassName="text-callout"
          />
        </span>
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
