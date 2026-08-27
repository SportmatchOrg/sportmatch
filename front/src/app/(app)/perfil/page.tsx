'use client';

import { ProfileHeader } from '@/components/profile/profile-header';
import { ProfileSkeleton } from '@/components/profile/profile-skeleton';
import { ProfileStats } from '@/components/profile/profile-stats';
import { RecentMatches } from '@/components/profile/recent-matches';
import { useCurrentUser } from '@/hooks/use-current-user';

export default function ProfilePage() {
  const { user, loading, error } = useCurrentUser();

  if (loading) {
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
      <ProfileHeader user={user} />
      <ProfileStats />
      <RecentMatches />
    </main>
  );
}
