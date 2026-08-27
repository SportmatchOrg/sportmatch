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
  'shadow-[0_6px_20px_0_rgba(0,0,0,0.45),inset_0_0_0_1px_rgba(255,255,255,0.15),inset_0_1px_0_0_rgba(255,255,255,0.4)]';

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
