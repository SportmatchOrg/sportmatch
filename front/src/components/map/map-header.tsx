'use client';

import type { ReactNode } from 'react';

import { MapSearchBar } from '@/components/map/map-search-bar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useUnreadCount } from '@/context/unread-count-context';

export function MapHeader({ children }: { children?: ReactNode }) {
  const { count: unreadCount } = useUnreadCount();

  return (
    <div className="absolute inset-x-4 top-4 z-10 flex flex-col gap-3 lg:hidden">
      <div className="flex items-center gap-2">
        <MapSearchBar className="min-w-0 flex-1" />
        <NotificationBell unreadCount={unreadCount} badgeClassName="ring-sheet" />
      </div>
      {children}
    </div>
  );
}
