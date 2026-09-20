'use client';

import { LoadingScreen } from '@/components/loading-screen';
import { SwipeDeck } from '@/components/matches/swipe-deck';
import { useMatches } from '@/hooks/use-matches';

export default function SearchPage() {
  const { matches, loading, error } = useMatches();

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
      <SwipeDeck matches={matches} />
    </main>
  );
}
