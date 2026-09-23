'use client';

import { Search, TriangleAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { use, useEffect } from 'react';

import {
  PlayedMatchesList,
  PlayedMatchesSkeleton,
} from '@/components/profile/played-matches-list';
import { PlayedMatchesScreen } from '@/components/profile/played-matches-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePublicProfile } from '@/hooks/use-public-profile';

export default function PublicPlayedMatchesPage({ params }: PageProps<'/usuarios/[id]/partidos'>) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading: currentUserLoading } = useCurrentUser();
  const { profile, matches, loading, notFound, error } = usePublicProfile(id);
  const isOwnProfile = user?.id === id;

  useEffect(() => {
    if (isOwnProfile) router.replace('/perfil/partidos');
  }, [isOwnProfile, router]);

  if (currentUserLoading || loading || isOwnProfile) {
    return (
      <PlayedMatchesScreen title="Partidos jugados">
        <PlayedMatchesSkeleton />
      </PlayedMatchesScreen>
    );
  }

  if (notFound || !profile) {
    return (
      <PlayedMatchesScreen title="Partidos jugados">
        <EmptyState
          icon={notFound ? Search : TriangleAlert}
          title={notFound ? 'No encontramos este jugador' : 'No pudimos cargar estos partidos'}
          text={
            notFound
              ? 'Puede que el perfil ya no exista o que el link esté mal.'
              : (error ?? 'Probá de nuevo en un momento.')
          }
        />
      </PlayedMatchesScreen>
    );
  }

  return (
    <PlayedMatchesScreen title={`Partidos de ${profile.name} · ${matches.length}`}>
      <PlayedMatchesList matches={matches} emptyTitle="Todavía no jugó ningún partido" />
    </PlayedMatchesScreen>
  );
}
