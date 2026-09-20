'use client';

import { Search, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { ProfileStats } from '@/components/profile/profile-stats';
import { RecentMatches } from '@/components/profile/recent-matches';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePublicProfile } from '@/hooks/use-public-profile';

export default function PublicProfilePage({ params }: PageProps<'/usuarios/[id]'>) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: currentUserLoading } = useCurrentUser();
  const { profile, matches, loading, notFound, error } = usePublicProfile(id);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (isOwnProfile) router.replace('/perfil');
  }, [isOwnProfile, router]);

  if (currentUserLoading || loading || isOwnProfile) {
    return (
      <main className="w-full">
        <ProfileSkeleton />
      </main>
    );
  }

  if (notFound || !profile) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <EmptyState
          icon={notFound ? Search : TriangleAlert}
          title={notFound ? 'No encontramos este jugador' : 'No pudimos cargar este perfil'}
          text={
            notFound
              ? 'Puede que el perfil ya no exista o que el link esté mal.'
              : (error ?? 'Probá de nuevo en un momento.')
          }
        />
      </main>
    );
  }

  return (
    <main className="w-full pb-10">
      <ProfileHeader user={profile} isOwnProfile={false} />
      <ProfileStats stats={profile.stats} />
      <RecentMatches
        matches={matches}
        error={null}
        seeAllHref={`/usuarios/${id}/partidos`}
        emptyTitle="Todavía no jugó ningún partido"
      />
    </main>
  );
}
