'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BrandLogo } from '@/components/brand-logo';
import { UserAvatar } from '@/components/user-avatar';
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

const ACTIVE_RING = 'shadow-bevel';

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
          className="size-[5px] rounded-full bg-brand shadow-brand-glow"
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
            <Link href="/" className="shrink-0">
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
              className="h-[42px] gap-2 rounded-full bg-brand px-5 text-callout text-white shadow-glow hover:bg-brand-bright"
            >
              <Plus className="size-[18px]" />
              Crear partido
            </Button>

            <Link
              href={PROFILE_HREF}
              aria-label="Perfil"
              aria-current={profileActive ? 'page' : undefined}
              className="inline-flex shrink-0 rounded-full ring-2 ring-brand ring-offset-2 ring-offset-raised transition"
            >
              <UserAvatar
                name={user?.displayName ?? user?.email ?? ''}
                photoUrl={user?.photoURL ?? null}
                sizes="42px"
                className="size-[42px]"
                initialsClassName="text-caption"
              />
            </Link>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
