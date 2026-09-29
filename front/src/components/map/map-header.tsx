'use client';

import { MapSearchBar } from '@/components/map/map-search-bar';
import { NotificationBell } from '@/components/notifications/notification-bell';
import { useUnreadCount } from '@/context/unread-count-context';

export function MapHeader() {
  const { count: unreadCount } = useUnreadCount();

  return (
    <div className="absolute inset-x-4 top-4 z-10 flex items-center gap-2 lg:hidden">
      <MapSearchBar className="min-w-0 flex-1" />
      <NotificationBell unreadCount={unreadCount} badgeClassName="ring-sheet" />
    </div>
  );
}
