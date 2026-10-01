'use client';

import { Bell } from 'lucide-react';
import { SPORT_ICON } from '@/components/matches/sport-icon';
import { UserAvatar } from '@/components/user-avatar';
import { formatMatchDay, formatMatchTime } from '@/lib/match-date';
import { notificationMessage } from '@/lib/notification-message';
import { formatRelativeTime } from '@/lib/relative-time';
import { cn } from '@/lib/utils';
import type { AppNotification } from '@/types/notification';

const ROW =
  'flex w-full items-center gap-3 rounded-md px-4 py-3 text-left transition-colors hover:bg-glass-strong focus-visible:outline-2 focus-visible:outline-brand';

const ICON_DISC =
  'flex size-10 shrink-0 items-center justify-center rounded-full bg-raised text-ink-64 shadow-bevel';

type NotificationRowProps = {
  notification: AppNotification;
  onSelect: (notification: AppNotification) => void;
};

type NotificationIconProps = {
  notification: AppNotification;
  showActor: boolean;
};

function NotificationIcon({ notification, showActor }: NotificationIconProps) {
  if (showActor && notification.actor) {
    return (
      <UserAvatar
        name={notification.actor.name}
        photoUrl={notification.actor.photoUrl}
        sizes="40px"
        className="size-10 shadow-bevel"
        initialsClassName="text-caption"
      />
    );
  }

  const Icon = notification.match ? SPORT_ICON[notification.match.sport.name] : Bell;

  return (
    <span className={ICON_DISC}>
      <Icon className="size-5" aria-hidden="true" />
    </span>
  );
}

export function NotificationRow({ notification, onSelect }: NotificationRowProps) {
  const unread = notification.readAt === null;
  const { actor, text } = notificationMessage(notification);

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(ROW, unread && 'bg-glass shadow-bevel')}
    >
      <NotificationIcon notification={notification} showActor={actor !== null} />

      <span className="flex min-w-0 flex-1 flex-col gap-1 lg:flex-row lg:items-center lg:gap-4">
        <span className={cn('text-callout lg:flex-1', unread ? 'text-white' : 'text-ink-64')}>
          {actor && <span className="font-semibold text-white">{actor} </span>}
          {text}
        </span>

        {notification.match && (
          <span className="hidden shrink-0 text-caption text-ink-46 lg:block">
            {notification.match.location} · {formatMatchDay(notification.match.date)}{' '}
            {formatMatchTime(notification.match.date)}
          </span>
        )}

        <span className="shrink-0 text-caption text-ink-46 lg:w-20 lg:text-right">
          {formatRelativeTime(notification.createdAt)}
        </span>
      </span>

      <span
        className={cn('size-2 shrink-0 rounded-full', unread && 'bg-brand shadow-brand-glow')}
        aria-hidden="true"
      />
      {unread && <span className="sr-only">Sin leer</span>}
    </button>
  );
}
