'use client';

import { useState } from 'react';

import { LoadingScreen } from '@/components/loading-screen';
import { DiscoverTutorial } from '@/components/matches/discover-tutorial';
import { SwipeDeck } from '@/components/matches/swipe-deck';
import { useDiscoverMatches } from '@/hooks/use-discover-matches';
import { useDiscoverOrigin } from '@/hooks/use-discover-origin';
import { hasSeenDiscoverTutorial, markDiscoverTutorialSeen } from '@/lib/discover-tutorial';

export default function SearchPage() {
  const { ready, origin } = useDiscoverOrigin();
  const { matches, loading, error, hasMore, loadMore, restart } = useDiscoverMatches(origin, ready);
  const [tutorialOpen, setTutorialOpen] = useState(() => !hasSeenDiscoverTutorial());

  function closeTutorial() {
    markDiscoverTutorialSeen();
    setTutorialOpen(false);
  }

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
      <SwipeDeck matches={matches} hasMore={hasMore} onLoadMore={loadMore} onRestart={restart} />
      {tutorialOpen && matches.length > 0 && <DiscoverTutorial onClose={closeTutorial} />}
    </main>
  );
}
