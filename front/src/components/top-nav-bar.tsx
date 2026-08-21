'use client';

import { Plus, User as UserIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { BRAND_ACCENT, BrandLogo } from '@/components/brand-logo';
import { Button } from '@/components/ui/button';
import { SpecularEdge } from '@/components/ui/specular-edge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/context/auth-context';
import { NAV_ITEMS, NEW_MATCH_HREF, PROFILE_HREF, isNavItemActive, type NavItem } from '@/lib/nav-items';
import { cn } from '@/lib/utils';

const PILL_RADIUS = 999;

function TopNavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;

  const itemClassName = cn(
    'relative flex items-center gap-2 rounded-full px-3.5 py-2 text-caption transition-colors xl:gap-2 xl:px-5 xl:py-2.5 xl:text-body',
    active ? 'bg-glass text-white' : 'text-neutral-400 hover:text-white'
  );

  const content = (
    <>
      <SpecularEdge
        radius={PILL_RADIUS}
        lineColor={BRAND_ACCENT}
        baseColor={BRAND_ACCENT}
        baseIntensity={active ? 1 : 0}
        proximity={180}
        autoAnimate={active}
      />
      <span className="relative z-[1] flex items-center gap-2">
        <Icon className="size-4 xl:size-5" aria-hidden="true" />
        {item.label}
        {active && <span className="size-1.5 rounded-full bg-accent" aria-hidden="true" />}
      </span>
    </>
  );

  if (!item.enabled) {
    return (
      <Tooltip>
        <TooltipTrigger
          type="button"
          aria-disabled="true"
          aria-label={item.label}
          className={cn(itemClassName, 'aria-disabled:cursor-not-allowed aria-disabled:opacity-70')}
        >
          {content}
        </TooltipTrigger>
        <TooltipContent>Próximamente</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <Link href={item.href} aria-current={active ? 'page' : undefined} className={itemClassName}>
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

            <nav aria-label="Navegación principal" className="flex items-center gap-2">
              {NAV_ITEMS.map((item) => (
                <TopNavLink key={item.href} item={item} active={isNavItemActive(pathname, item.href)} />
              ))}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <Button
              nativeButton={false}
              render={<Link href={NEW_MATCH_HREF} />}
              className="h-11 gap-2 rounded-full bg-accent px-5 text-caption font-semibold text-white shadow-glow hover:bg-accent-bright xl:h-12 xl:px-7 xl:text-body"
            >
              <Plus className="size-5" />
              Crear partido
            </Button>

            <Link
              href={PROFILE_HREF}
              aria-label="Perfil"
              aria-current={profileActive ? 'page' : undefined}
              className={cn(
                'flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-glass-strong text-neutral-400 ring-1 ring-glass-strong transition xl:size-12',
                profileActive && 'ring-2 ring-accent'
              )}
            >
              {user?.photoURL ? (
                <img src={user.photoURL} alt="" className="size-full object-cover" />
              ) : (
                <UserIcon className="size-6" aria-hidden="true" />
              )}
            </Link>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
