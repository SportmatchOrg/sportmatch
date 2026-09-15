'use client';

import { Plus } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { TOAST_DURATION, Toast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';
import { NAV_ITEMS, NEW_MATCH_HREF, isNavItemActive, type NavItem } from '@/lib/nav-items';

const LEFT_ITEMS = NAV_ITEMS.slice(0, 2);
const RIGHT_ITEMS = NAV_ITEMS.slice(2);

const SHEET_SHADOW =
  'shadow-float-glass';

function TabBarLink({
  item,
  active,
  onUnavailable,
}: {
  item: NavItem;
  active: boolean;
  onUnavailable: () => void;
}) {
  const Icon = item.icon;

  const itemClassName = cn(
    'relative flex size-[50px] shrink-0 items-center justify-center rounded-full transition-colors',
    active ? 'text-white' : 'text-white/46'
  );

  const content = (
    <>
      <Icon className="size-6" aria-hidden="true" />
      {active && (
        <span
          className="absolute bottom-[7px] left-1/2 size-[5px] -translate-x-1/2 rounded-full bg-brand shadow-brand-glow"
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
          onClick={onUnavailable}
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
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(itemClassName, !active && 'hover:text-white')}
    >
      {content}
    </Link>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => setToast(false), TOAST_DURATION);
    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <TooltipProvider>
      {toast && (
        <div className="fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
          <Toast message="Próximamente" tone="info" />
        </div>
      )}

      <nav
        aria-label="Navegación principal"
        className={cn(
          'fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center justify-between rounded-full bg-sheet/60 px-4 py-[7px] backdrop-blur-[20px] lg:hidden',
          SHEET_SHADOW
        )}
      >

        {LEFT_ITEMS.map((item) => (
          <TabBarLink
            key={item.href}
            item={item}
            active={isNavItemActive(pathname, item.href)}
            onUnavailable={() => setToast(true)}
          />
        ))}

        <Link
          href={NEW_MATCH_HREF}
          aria-label="Crear partido"
          aria-current={isNavItemActive(pathname, NEW_MATCH_HREF) ? 'page' : undefined}
          className="mx-[2px] flex size-[58px] shrink-0 items-center justify-center rounded-full bg-brand text-midnight drop-shadow-brand-glow transition hover:bg-brand-bright"
        >
          <Plus className="size-[26px]" aria-hidden="true" />
        </Link>

        {RIGHT_ITEMS.map((item) => (
          <TabBarLink
            key={item.href}
            item={item}
            active={isNavItemActive(pathname, item.href)}
            onUnavailable={() => setToast(true)}
          />
        ))}
      </nav>
    </TooltipProvider>
  );
}
