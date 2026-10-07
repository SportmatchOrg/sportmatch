'use client';

import { EditProfileForm } from '@/components/profile/edit-profile-form';
import { EditProfileLayout } from '@/components/profile/edit-profile-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function EditProfilePage() {
  const { user, loading, error } = useCurrentUser();

  if (loading) {
    return (
      <EditProfileLayout>
        <div
          aria-busy="true"
          aria-label="Cargando tu perfil"
          className="flex flex-col gap-4 lg:grid lg:grid-cols-2 lg:gap-8"
        >
          {[0, 1, 2, 3].map((index) => (
            <Skeleton key={index} className="h-14 rounded-full lg:h-12" />
          ))}
        </div>
      </EditProfileLayout>
    );
  }

  if (error || !user) {
    return (
      <EditProfileLayout>
        <div className="flex flex-col items-center gap-2 py-16 text-center">
          <h2 className="text-headline font-bold text-white">No pudimos cargar tu perfil</h2>
          <p className="text-callout text-ink-46">{error}</p>
        </div>
      </EditProfileLayout>
    );
  }

  return <EditProfileForm user={user} />;
}
