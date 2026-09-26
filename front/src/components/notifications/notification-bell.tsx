'use client';

import { Bell, BellRing } from 'lucide-react';
import Link from 'next/link';

import { CountBadge } from '@/components/ui/count-badge';
import {
  iconButtonClassName,
  type IconButtonSize,
  type IconButtonVariant,
} from '@/components/ui/icon-button';
import { NOTIFICATIONS_HREF } from '@/lib/nav-items';
import { withUnreadLabel } from '@/lib/notifications';
import { cn } from '@/lib/utils';

type NotificationBellProps = {
  unreadCount: number;
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  badgeClassName?: string;
};

export function NotificationBell({
  unreadCount,
  variant = 'glass',
  size,
  badgeClassName,
}: NotificationBellProps) {
  const Icon = unreadCount > 0 ? BellRing : Bell;

  return (
    <Link
      href={NOTIFICATIONS_HREF}
      aria-label={withUnreadLabel('Notificaciones', unreadCount)}
      className={cn(iconButtonClassName(variant, size), 'relative')}
    >
      <Icon className="size-5" aria-hidden="true" />
      <CountBadge
        count={unreadCount}
        className={cn('absolute top-0.5 right-0.5', badgeClassName)}
      />
    </Link>
  );
}
