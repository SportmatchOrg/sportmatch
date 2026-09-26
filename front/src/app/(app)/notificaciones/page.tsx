import { Bell } from 'lucide-react';

import { EmptyState } from '@/components/ui/empty-state';
import { ScreenHeader } from '@/components/ui/screen-header';

const PAGE = 'flex w-full flex-col gap-6 px-5 py-6 lg:px-6 lg:py-10 xl:px-8';

export default function NotificationsPage() {
  return (
    <main className={PAGE}>
      <ScreenHeader overline="Actividad" title="Notificaciones" />

      <div className="py-16">
        <EmptyState
          icon={Bell}
          title="Muy pronto"
          text="Acá vas a ver las novedades de tus partidos y solicitudes."
        />
      </div>
    </main>
  );
}
