import { NotificationRow } from '@/components/notifications/notification-row';
import { Skeleton } from '@/components/ui/skeleton';
import type { AppNotification } from '@/types/notification';

const SKELETON_ROWS = [0, 1, 2, 3, 4];

type NotificationListProps = {
  notifications: AppNotification[];
  onSelect: (notification: AppNotification) => void;
};

export function NotificationListSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {SKELETON_ROWS.map((index) => (
        <Skeleton key={index} className="h-16 rounded-md" />
      ))}
    </div>
  );
}

export function NotificationList({ notifications, onSelect }: NotificationListProps) {
  return (
    <ul className="flex flex-col gap-2">
      {notifications.map((notification) => (
        <li key={notification.id}>
          <NotificationRow notification={notification} onSelect={onSelect} />
        </li>
      ))}
    </ul>
  );
}
