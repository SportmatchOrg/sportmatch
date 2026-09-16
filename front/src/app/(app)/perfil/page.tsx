'use client';

import { PendingRatingsBanner } from '@/components/ratings/pending-ratings-banner';
import { ProfileHeader } from '@/components/profile/profile-header';
import { PROFILE_SECTION } from '@/components/profile/profile-layout';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { ProfileStats } from '@/components/profile/profile-stats';
import { RecentMatches } from '@/components/profile/recent-matches';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePartidosMios } from '@/hooks/use-partidos-mios';

export default function ProfilePage() {
  const { user, loading, error } = useCurrentUser();
  const {
    jugados,
    loading: partidosLoading,
    error: partidosError,
    reload: reloadPartidos,
  } = usePartidosMios();

  if (loading || partidosLoading) {
    return (
      <main className="w-full">
        <ProfileSkeleton />
      </main>
    );
  }

  if (error || !user) {
    return (
      <main className="mx-auto flex w-full max-w-md flex-col items-center gap-2 px-5 py-16 text-center">
        <h1 className="text-title">No pudimos cargar tu perfil</h1>
        <p className="text-body text-white/46">{error}</p>
      </main>
    );
  }

  return (
    <main className="w-full pb-10">
      <ProfileHeader user={user} isOwnProfile />
      <ProfileStats stats={user.stats} />

      <div className={`${PROFILE_SECTION} pt-4 lg:pt-6`}>
        <PendingRatingsBanner
          matches={jugados.filter(({ rating_pending }) => rating_pending === true)}
          onRated={reloadPartidos}
        />
      </div>

      <RecentMatches partidos={jugados} error={partidosError} />
    </main>
  );
}
