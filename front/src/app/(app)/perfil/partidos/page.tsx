'use client';

import { TriangleAlert } from 'lucide-react';

import {
  PlayedMatchesList,
  PlayedMatchesSkeleton,
} from '@/components/profile/played-matches-list';
import { PlayedMatchesScreen } from '@/components/profile/played-matches-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { useMyMatches } from '@/hooks/use-my-matches';

export default function OwnPlayedMatchesPage() {
  const { played, loading, error } = useMyMatches();

  if (loading) {
    return (
      <PlayedMatchesScreen title="Partidos jugados">
        <PlayedMatchesSkeleton />
      </PlayedMatchesScreen>
    );
  }

  if (error) {
    return (
      <PlayedMatchesScreen title="Partidos jugados">
        <EmptyState icon={TriangleAlert} title="No pudimos cargar tus partidos" text={error} />
      </PlayedMatchesScreen>
    );
  }

  return (
    <PlayedMatchesScreen title={`Partidos jugados · ${played.length}`}>
      <PlayedMatchesList matches={played} emptyTitle="Todavía no jugaste ningún partido" />
    </PlayedMatchesScreen>
  );
}
