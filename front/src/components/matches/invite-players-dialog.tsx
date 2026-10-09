'use client';

import { UserPlus, X } from 'lucide-react';
import { useId, useState } from 'react';

import { UserAvatar } from '@/components/user-avatar';
import {
  Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PillButton } from '@/components/ui/pill-button';
import { RetryButton } from '@/components/ui/retry-button';
import { useInvitations } from '@/hooks/use-invitations';
import { usePlayerSearch } from '@/hooks/use-player-search';
import { INVITATION_STATUS_LABEL } from '@/lib/invitations';
import { USER_SEARCH_MAX_LENGTH, USER_SEARCH_MIN_LENGTH } from '@/lib/users';
import type { MatchDetail } from '@/types/match';

function InvitationDialogContent({ match }: { match: MatchDetail }) {
  const searchId = useId();
  const [query, setQuery] = useState('');
  const search = usePlayerSearch(query);
  const {
    invitations, loading, error: loadError, reload: reloadInvitations,
    invite, canInvite, sendingId, sendError, success,
  } = useInvitations(match.id);

  return (
    <DialogContent className="max-h-[calc(100dvh-2rem)] max-w-lg overflow-y-auto">
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-2">
          <DialogTitle>Invitar jugadores</DialogTitle>
          <DialogDescription>Buscá por nombre y sumá jugadores a tu partido.</DialogDescription>
        </div>
        <DialogClose
          aria-label="Cerrar"
          render={<PillButton variant="glass" size="md" className="shrink-0 px-3" />}
        >
          <X className="size-5" aria-hidden="true" />
        </DialogClose>
      </div>

      <div className="flex flex-col gap-3">
        <Label htmlFor={searchId}>Buscar jugadores</Label>
        <Input
          id={searchId}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Escribí un nombre"
          maxLength={USER_SEARCH_MAX_LENGTH}
          autoComplete="off"
          className="h-11 px-4 text-body md:text-body"
        />
        {!search.ready ? (
          <p className="text-callout text-ink-64">
            Escribí al menos {USER_SEARCH_MIN_LENGTH} letras para buscar.
          </p>
        ) : search.loading ? (
          <p role="status" className="text-callout text-ink-64">Buscando jugadores…</p>
        ) : search.error ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-callout text-danger">{search.error}</p>
            <RetryButton onRetry={search.reload} />
          </div>
        ) : search.users.length === 0 ? (
          <p role="status" className="text-callout text-ink-64">No encontramos jugadores</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {search.users.map((user) => {
              const invitation = invitations.find((item) => item.userId === user.id);
              const joined = match.participants.some((player) => player.id === user.id)
                || invitation?.status === 'ACCEPTED';
              const invited = invitation?.status === 'PENDING';
              return (
                <li key={user.id} className="flex items-center gap-3 rounded-md bg-glass p-3">
                  <UserAvatar name={user.name} photoUrl={user.photoUrl} sizes="40px" className="size-10" />
                  <span className="min-w-0 flex-1 break-words text-callout font-semibold">{user.name}</span>
                  {joined || invited ? (
                    <span className="shrink-0 text-caption text-ink-64">
                      {joined ? 'Ya está anotado' : 'Invitado'}
                    </span>
                  ) : (
                    <PillButton
                      size="md"
                      className="shrink-0 px-4"
                      disabled={!canInvite}
                      onClick={() => void invite(user)}
                      aria-label={`Invitar a ${user.name}`}
                    >
                      {sendingId === user.id ? 'Enviando…' : 'Invitar'}
                    </PillButton>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {sendError && <p role="alert" className="text-callout text-danger">{sendError}</p>}
        {success && <p role="status" className="text-callout text-success">{success}</p>}
      </div>

      <section className="flex flex-col gap-3 border-t border-glass-strong pt-4" aria-label="Invitaciones del partido">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-subhead">Invitaciones</h2>
          <PillButton variant="glass" size="md" className="px-4" disabled={loading || sendingId !== null} onClick={reloadInvitations}>
            Actualizar
          </PillButton>
        </div>
        {loading ? (
          <p role="status" className="text-callout text-ink-64">Cargando invitaciones…</p>
        ) : loadError ? (
          <div className="flex flex-col items-start gap-3">
            <p role="alert" className="text-callout text-danger">{loadError}</p>
            <RetryButton onRetry={reloadInvitations} />
          </div>
        ) : invitations.length === 0 ? (
          <p className="text-callout text-ink-64">Todavía no invitaste a nadie.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {invitations.map((invitation) => (
              <li key={invitation.id} className="flex items-center gap-3">
                <UserAvatar name={invitation.user.name} photoUrl={invitation.user.photoUrl} sizes="40px" className="size-10" />
                <span className="min-w-0 flex-1 break-words text-callout">{invitation.user.name}</span>
                <span className="shrink-0 text-caption text-ink-64">{INVITATION_STATUS_LABEL[invitation.status]}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </DialogContent>
  );
}

export function InvitePlayersDialog({ match }: { match: MatchDetail }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<PillButton variant="glass" className="w-full" />}>
        <UserPlus className="size-5" aria-hidden="true" />
        Invitar jugadores
      </DialogTrigger>
      {open && <InvitationDialogContent key={match.id} match={match} />}
    </Dialog>
  );
}
