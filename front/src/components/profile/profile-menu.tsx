'use client';

import { signOut } from 'firebase/auth';
import { LogOut, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { auth } from '@/lib/firebase';
import { cn } from '@/lib/utils';

const LOGIN_ROUTE = '/login';

const BEVEL =
  'shadow-float-glass';

const TRIGGER_BASE =
  'flex items-center justify-center bg-glass-strong text-white backdrop-blur-[12px] transition hover:bg-white/20';

const TRIGGER_VARIANTS = {
  icon: 'size-11 rounded-full',
  labelled: 'h-[46px] gap-2 rounded-full px-[22px] text-callout',
} as const;

type ProfileMenuProps = {
  variant?: keyof typeof TRIGGER_VARIANTS;
  className?: string;
};

export function ProfileMenu({ variant = 'icon', className }: ProfileMenuProps) {
  const router = useRouter();

  async function handleSignOut() {
    await signOut(auth);
    router.replace(LOGIN_ROUTE);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Opciones de perfil"
        className={cn(TRIGGER_BASE, BEVEL, TRIGGER_VARIANTS[variant], className)}
      >
        <SlidersHorizontal className="size-[22px] shrink-0" aria-hidden="true" />
        {variant === 'labelled' && 'Ajustes'}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut />
          Cerrar sesión
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
