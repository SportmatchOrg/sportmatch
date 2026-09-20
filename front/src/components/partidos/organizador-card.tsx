import Link from 'next/link';

import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/match';

export function OrganizadorCard({ organizer }: { organizer: PublicUser }) {
  return (
    <div className="flex items-center gap-4 rounded-md bg-glass p-4 shadow-bevel-lit">
      <UserAvatar
        name={organizer.name}
        photoUrl={organizer.photoUrl}
        sizes="56px"
        className="size-14 ring-2 ring-brand"
        initialsClassName="text-callout"
      />

      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-caption text-ink-46">Organiza</span>
        <span className="truncate text-headline font-bold text-white">{organizer.name}</span>
      </span>

      <Link
        href={`/usuarios/${organizer.id}`}
        className="shrink-0 rounded-full bg-glass-strong px-5 py-3 text-callout font-semibold text-white shadow-bevel-lit transition hover:bg-glass focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none"
      >
        Ver perfil
      </Link>
    </div>
  );
}
