'use client';

import { Search, X } from 'lucide-react';
import Link from 'next/link';
import { useId, useRef, useState } from 'react';

import { profileActionClassName, type ProfileActionVariant } from '@/components/profile/settings-link';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PillButton } from '@/components/ui/pill-button';
import { RetryButton } from '@/components/ui/retry-button';
import { UserAvatar } from '@/components/user-avatar';
import { usePlayerSearch } from '@/hooks/use-player-search';
import { USER_SEARCH_MAX_LENGTH, USER_SEARCH_MIN_LENGTH } from '@/lib/users';

function PlayerSearchContent({ onNavigate }: { onNavigate: () => void }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const { ready, users, loading, error, reload } = usePlayerSearch(query);

  return (
    <DialogContent
      initialFocus={inputRef}
      className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <DialogTitle>Buscar jugador</DialogTitle>
          <DialogDescription>Buscá por nombre para abrir el perfil de un jugador.</DialogDescription>
        </div>
        <DialogClose
          aria-label="Cerrar"
          render={<PillButton variant="glass" size="md" className="shrink-0 px-3" />}
        >
          <X className="size-5" aria-hidden="true" />
        </DialogClose>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor={inputId}>Nombre del jugador</Label>
        <Input
          ref={inputRef}
          id={inputId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Escribí un nombre"
          maxLength={USER_SEARCH_MAX_LENGTH}
          autoComplete="off"
          className="h-11 px-4 text-body md:text-body"
        />
        {!ready ? (
          <p className="text-callout text-ink-64">
            Escribí al menos {USER_SEARCH_MIN_LENGTH} letras para buscar.
          </p>
        ) : loading ? (
          <p role="status" className="text-callout text-ink-64">Buscando jugadores…</p>
        ) : error ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-callout text-danger">{error}</p>
            <RetryButton onRetry={reload} />
          </div>
        ) : users.length === 0 ? (
          <p role="status" className="text-callout text-ink-64">No encontramos jugadores</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {users.map((user) => (
              <li key={user.id}>
                <Link
                  href={`/usuarios/${user.id}`}
                  onNavigate={onNavigate}
                  className="flex items-center gap-3 rounded-md bg-glass p-3 transition-colors hover:bg-glass-strong focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <UserAvatar name={user.name} photoUrl={user.photoUrl} sizes="40px" className="size-10 shrink-0" />
                  <span className="min-w-0 flex-1 break-words text-callout font-semibold">{user.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DialogContent>
  );
}

type PlayerSearchButtonProps = {
  variant: ProfileActionVariant;
  className?: string;
};

export function PlayerSearchButton({ variant, className }: PlayerSearchButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        aria-label={variant === 'icon' ? 'Buscar jugador' : undefined}
        className={profileActionClassName(variant, className)}
      >
        <Search className="size-[22px] shrink-0" aria-hidden="true" />
        {variant === 'labelled' && 'Buscar jugador'}
      </DialogTrigger>
      {open && <PlayerSearchContent onNavigate={() => setOpen(false)} />}
    </Dialog>
  );
}
