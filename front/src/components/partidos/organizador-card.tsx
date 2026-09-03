import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { UserAvatar } from '@/components/user-avatar';
import type { PublicUser } from '@/types/partido';

export function OrganizadorCard({ organizador }: { organizador: PublicUser }) {
  return (
    <div className="flex items-center gap-4 rounded-md bg-glass p-4 shadow-bevel-lit">
      <UserAvatar
        name={organizador.nombre}
        photoUrl={organizador.fotoUrl}
        sizes="56px"
        className="size-14 ring-2 ring-brand"
        initialsClassName="text-callout"
      />

      <span className="flex flex-1 flex-col gap-0.5">
        <span className="text-caption text-ink-46">Organiza</span>
        <span className="text-headline font-bold text-white">{organizador.nombre}</span>
      </span>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            type="button"
            aria-disabled="true"
            className="hidden shrink-0 rounded-full bg-glass-strong px-5 py-3 text-callout font-semibold text-white shadow-bevel-lit aria-disabled:cursor-not-allowed lg:block"
          >
            Ver perfil
          </TooltipTrigger>
          <TooltipContent>Próximamente</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
