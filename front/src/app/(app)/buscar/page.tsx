'use client';

import { LoadingScreen } from '@/components/loading-screen';
import { SwipeDeck } from '@/components/partidos/swipe-deck';
import { usePartidos } from '@/hooks/use-partidos';

export default function BuscarPage() {
  const { partidos, loading, error } = usePartidos();

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <main className="flex min-h-dvh items-center justify-center px-8">
        <p role="alert" className="text-center text-callout text-danger">
          {error}
        </p>
      </main>
    );
  }

  return (
    <main className="relative lg:h-[calc(100dvh-5rem)]">
      <SwipeDeck partidos={partidos} />
    </main>
  );
}
