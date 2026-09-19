'use client';

import { TriangleAlert } from 'lucide-react';

import {
  PlayedMatchesList,
  PlayedMatchesSkeleton,
} from '@/components/profile/played-matches-list';
import { PlayedMatchesScreen } from '@/components/profile/played-matches-screen';
import { EmptyState } from '@/components/ui/empty-state';
import { usePartidosMios } from '@/hooks/use-partidos-mios';

export default function OwnPlayedMatchesPage() {
  const { jugados, loading, error } = usePartidosMios();

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
    <PlayedMatchesScreen title={`Partidos jugados · ${jugados.length}`}>
      <PlayedMatchesList matches={jugados} emptyTitle="Todavía no jugaste ningún partido" />
    </PlayedMatchesScreen>
  );
}
