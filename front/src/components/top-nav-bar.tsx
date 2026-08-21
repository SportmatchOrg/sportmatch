'use client';

import { Plus, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/context/auth-context';
import { NAV_ITEMS, NEW_MATCH_HREF, PROFILE_HREF, isNavItemActive, type NavItem } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

const ACTIVE_RING = 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]';

function TopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  const itemClassName = cn(
    'flex h-[42px] shrink-0 items-center gap-[9px] rounded-full px-[18px] text-callout transition-colors',
    active ? cn('bg-glass-strong text-white', ACTIVE_RING) : 'text-white/46'
  );

  const content = (
    <>
      <Icon className="size-[18px]" aria-hidden="true" />
      {item.label}
      {active && (
        <span
          className="size-[5px] rounded-full bg-accent shadow-[0_0_8px_0_rgba(78,168,255,0.45)]"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (!item.enabled) {
    return (
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-disabled="true"
          aria-label={item.label}
          className={cn(itemClassName, 'aria-disabled:cursor-not-allowed')}
        >
          {content}
        </TooltipTrigger>
        <TooltipContent>Próximamente</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      className={cn(itemClassName, !active && 'hover:text-white')}
    >
      {content}
    </Link>
  );
}

export function TopNavBar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const profileActive = isNavItemActive(pathname, PROFILE_HREF);

  return (
    <TooltipProvider>
      <header className="fixed inset-x-0 top-0 z-50 hidden border-b border-glass-strong bg-raised/95 backdrop-blur-md lg:block">
        <div className="flex h-20 w-full items-center justify-between gap-4 px-6 xl:gap-6 xl:px-8">
          <div className="flex items-center gap-6 xl:gap-8">
            <Link href="/home" className="shrink-0">
              <BrandLogo className="text-2xl xl:text-title" />
            </Link>

            <nav aria-label="Navegación principal" className="flex items-center gap-1.5">
              {NAV_ITEMS.map((item) => (
                <TopNavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href={NEW_MATCH_HREF} />}
              className="h-[42px] gap-2 rounded-full bg-accent px-5 text-callout text-white shadow-glow hover:bg-accent-bright"
            >
              <Plus className="size-[18px]" />
              Crear partido
            </Button>

            <Link
              href={PROFILE_HREF}
              aria-label="Perfil"
              aria-current={profileActive ? 'page' : undefined}
              className={cn(
                'flex size-[42px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-glass-strong text-white/46 transition',
                profileActive ? 'ring-2 ring-accent' : ACTIVE_RING
              )}
            >
              {user?.photoURL ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.photoURL} alt="" className="size-full object-cover" />
              ) : (
                <UserIcon className="size-[18px]" aria-hidden="true" />
              )}
            </Link>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
