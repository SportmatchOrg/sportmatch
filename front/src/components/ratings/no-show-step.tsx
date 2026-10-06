import { Checkbox } from '@base-ui/react/checkbox';
import { Check } from 'lucide-react';

import { PillButton } from '@/components/ui/pill-button';
import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/match';

type NoShowStepProps = {
  players: PublicUser[];
  selectedIds: string[];
  submitting: boolean;
  onToggle: (id: string, checked: boolean) => void;
  onContinue: () => void;
};

export function NoShowStep({
  players,
  selectedIds,
  submitting,
  onToggle,
  onContinue,
}: NoShowStepProps) {
  return (
    <>
      <ul className="flex min-h-0 flex-col gap-2 overflow-y-auto">
        {players.map((player) => (
          <li key={player.id}>
            <label className="flex cursor-pointer items-center gap-3 rounded-sm bg-glass p-3">
              <UserAvatar
                name={player.name}
                photoUrl={player.photoUrl}
                sizes="40px"
                className="size-10"
              />
              <span className="min-w-0 flex-1 break-words text-callout text-white">
                {player.name}
              </span>
              <Checkbox.Root
                checked={selectedIds.includes(player.id)}
                disabled={submitting}
                onCheckedChange={(checked) => onToggle(player.id, checked)}
                aria-label={`Marcar falta de ${player.name}`}
                className="flex size-6 shrink-0 items-center justify-center rounded-xs border border-glass-strong bg-raised outline-none focus-visible:ring-2 focus-visible:ring-brand data-checked:border-brand data-checked:bg-brand data-checked:text-midnight"
              >
                <Checkbox.Indicator>
                  <Check className="size-4" aria-hidden="true" />
                </Checkbox.Indicator>
              </Checkbox.Root>
            </label>
          </li>
        ))}
      </ul>
      <PillButton disabled={submitting || players.length === 0} onClick={onContinue}>
        {submitting ? 'Enviando…' : selectedIds.length ? 'Continuar' : 'Nadie faltó'}
      </PillButton>
    </>
  );
}
