'use client';

import { useInfiniteQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { useAuth } from '@/context/auth-context';
import { nearbyQuery, type NearbyOrigin } from '@/lib/map-filters';
import { fetchMatchesPage, MATCHES_ERROR_MESSAGE, type MatchesPage } from '@/lib/matches';
import { matchKeys } from '@/lib/query-keys';
import type { Match, MatchesQuery } from '@/types/match';

const PAGE_SIZE = 30;

const DISCOVER_RADIUS_KM = 50;

const ANYWHERE: MatchesQuery = {};

type Cursor = string | undefined;

type DiscoverData = InfiniteData<MatchesPage, Cursor>;

function uniqueMatches(pages: MatchesPage[]): Match[] {
  const byId = new Map(pages.flatMap((page) => page.matches).map((match) => [match.id, match]));

  return [...byId.values()];
}

function keepFirstPage(data: DiscoverData | undefined): DiscoverData | undefined {
  return data && { pages: data.pages.slice(0, 1), pageParams: data.pageParams.slice(0, 1) };
}

export function useDiscoverMatches(origin: NearbyOrigin | null, enabled: boolean) {
  const queryClient = useQueryClient();
  const { user: firebaseUser, loading: sessionLoading } = useAuth();
  const query = useMemo(
    () => (origin ? nearbyQuery(origin, DISCOVER_RADIUS_KM) : ANYWHERE),
    [origin]
  );
  const queryKey = useMemo(() => matchKeys.discover(query), [query]);

  const { data, isPending, isLoadingError, hasNextPage, isFetchingNextPage, fetchNextPage, refetch } =
    useInfiniteQuery({
      queryKey,
      queryFn: ({ pageParam, signal }) =>
        fetchMatchesPage({ ...query, limit: PAGE_SIZE, cursor: pageParam }, signal),
      initialPageParam: undefined as Cursor,
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: enabled && !sessionLoading && !!firebaseUser,
      refetchOnWindowFocus: false,
    });

  const matches = useMemo(() => uniqueMatches(data?.pages ?? []), [data]);

  const loadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) void fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const restart = useCallback(() => {
    queryClient.setQueryData<DiscoverData>(queryKey, keepFirstPage);
    void refetch();
  }, [queryClient, queryKey, refetch]);

  return {
    matches,
    loading: !enabled || sessionLoading || isPending,
    error: isLoadingError ? MATCHES_ERROR_MESSAGE : null,
    hasMore: hasNextPage,
    loadMore,
    restart,
  };
}
