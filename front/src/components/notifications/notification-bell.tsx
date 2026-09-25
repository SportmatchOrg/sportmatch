'use client';

import { Bell } from 'lucide-react';
import Link from 'next/link';

import { CountBadge } from '@/components/ui/count-badge';
import { iconButtonClassName, type IconButtonSize } from '@/components/ui/icon-button';
import { NOTIFICATIONS_HREF } from '@/lib/nav-items';
import { withUnreadLabel } from '@/lib/notifications';
import { cn } from '@/lib/utils';

type NotificationBellProps = {
  unreadCount: number;
  size?: IconButtonSize;
  badgeClassName?: string;
};

export function NotificationBell({ unreadCount, size, badgeClassName }: NotificationBellProps) {
  return (
    <Link
      href={NOTIFICATIONS_HREF}
      aria-label={withUnreadLabel('Notificaciones', unreadCount)}
      className={cn(iconButtonClassName('glass', size), 'relative')}
    >
      <Bell className="size-5" aria-hidden="true" />
      <CountBadge count={unreadCount} className={cn('absolute -top-1 -right-1', badgeClassName)} />
    </Link>
  );
}
